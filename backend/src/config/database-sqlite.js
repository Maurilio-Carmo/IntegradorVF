// backend/src/config/database-sqlite.js

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * Classe de conexão com SQLite
 * Gerencia conexão, queries e transações com banco SQLite
 */
class DatabaseSQLite {
  constructor() {
    this.db = null;
  }

  /**
   * Conectar ao banco de dados SQLite
   */
  connect() {
    try {
      const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/IntegradorVF.db');
      
      // Criar diretório se não existir
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 Diretório criado: ${dbDir}`);
      }

      // Configurar conexão
      this.db = new Database(dbPath, {
        verbose: process.env.NODE_ENV === 'development' ? console.log : null,
        fileMustExist: false
      });

      // Configurações de performance e integridade
      this.db.pragma('foreign_keys = ON');           // Habilitar chaves estrangeiras
      this.db.pragma('journal_mode = WAL');          // Write-Ahead Logging para melhor performance
      this.db.pragma('synchronous = NORMAL');        // Balancear segurança e velocidade
      this.db.pragma('cache_size = 10000');          // Cache de 10MB
      this.db.pragma('temp_store = MEMORY');         // Tabelas temporárias em memória
      this.db.pragma('mmap_size = 30000000000');     // Memory-mapped I/O

      console.log('✅ Conexão SQLite estabelecida');
      console.log(`📍 Localização: ${dbPath}`);
      
      return this.db;
    } catch (error) {
      console.error('❌ Erro ao conectar com SQLite:', error);
      throw error;
    }
  }

  /**
   * Obter conexão ativa
   */
  getConnection() {
    if (!this.db) {
      return this.connect();
    }
    return this.db;
  }

  /**
   * Fechar conexão
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('🔌 Conexão SQLite fechada');
    }
  }

  /**
   * Executar query SELECT (retorna múltiplas linhas)
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Array} Resultados
   */
  query(sql, params = []) {
    try {
      const db = this.getConnection();
      const stmt = db.prepare(sql);
      return stmt.all(params);
    } catch (error) {
      console.error('❌ Erro ao executar query:', error);
      throw error;
    }
  }

  /**
   * Executar query SELECT (retorna uma única linha)
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Object|undefined} Resultado
   */
  get(sql, params = []) {
    try {
      const db = this.getConnection();
      const stmt = db.prepare(sql);
      return stmt.get(params);
    } catch (error) {
      console.error('❌ Erro ao buscar registro:', error);
      throw error;
    }
  }

  /**
   * Executar comando INSERT, UPDATE, DELETE
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Object} { changes, lastInsertRowid }
   */
  run(sql, params = []) {
    try {
      const db = this.getConnection();
      const stmt = db.prepare(sql);
      return stmt.run(params);
    } catch (error) {
      console.error('❌ Erro ao executar comando:', error);
      throw error;
    }
  }

  /**
   * Executar múltiplos comandos em uma transação
   * @param {Function} callback - Função com operações do banco
   * @returns {Function} Função de transação
   */
  transaction(callback) {
    const db = this.getConnection();
    return db.transaction(callback);
  }

  /**
   * Executar INSERT em lote (bulk insert)
   * @param {string} tableName - Nome da tabela
   * @param {Array} columns - Array com nomes das colunas
   * @param {Array} rows - Array de arrays com valores
   */
  bulkInsert(tableName, columns, rows) {
    try {
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      
      const transaction = this.transaction(() => {
        const stmt = this.db.prepare(sql);
        for (const row of rows) {
          stmt.run(row);
        }
      });

      transaction();
      console.log(`✅ Inseridos ${rows.length} registros em ${tableName}`);
      
      return { insertedCount: rows.length };
    } catch (error) {
      console.error(`❌ Erro no bulk insert na tabela ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Verificar se tabela existe
   * @param {string} tableName - Nome da tabela
   * @returns {boolean}
   */
  tableExists(tableName) {
    const result = this.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );
    return !!result;
  }

  /**
   * Obter lista de todas as tabelas
   * @returns {Array} Lista de nomes de tabelas
   */
  getTables() {
    const tables = this.query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    );
    return tables.map(t => t.name);
  }

  /**
   * Obter estrutura de uma tabela
   * @param {string} tableName - Nome da tabela
   * @returns {Array} Colunas da tabela
   */
  getTableSchema(tableName) {
    return this.query(`PRAGMA table_info(${tableName})`);
  }

  /**
   * Contar registros em uma tabela
   * @param {string} tableName - Nome da tabela
   * @returns {number} Total de registros
   */
  count(tableName) {
    const result = this.get(`SELECT COUNT(*) as total FROM ${tableName}`);
    return result.total;
  }

  /**
   * Limpar todos os dados de uma tabela
   * @param {string} tableName - Nome da tabela
   */
  truncate(tableName) {
    try {
      this.run(`DELETE FROM ${tableName}`);
      console.log(`🗑️  Tabela ${tableName} limpa`);
    } catch (error) {
      console.error(`❌ Erro ao limpar tabela ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Executar backup do banco de dados
   * @param {string} backupPath - Caminho para salvar o backup
   */
  backup(backupPath) {
    try {
      const db = this.getConnection();
      db.backup(backupPath);
      console.log(`💾 Backup criado: ${backupPath}`);
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  /**
   * Obter informações do banco de dados
   * @returns {Object} Informações do banco
   */
  getInfo() {
    const tables = this.getTables();
    const info = {
      tables: tables.length,
      tableNames: tables,
      size: this.getDatabaseSize(),
      details: {}
    };

    // Contar registros em cada tabela
    for (const table of tables) {
      info.details[table] = this.count(table);
    }

    return info;
  }

  /**
   * Obter tamanho do banco de dados em bytes
   * @returns {number} Tamanho em bytes
   */
  getDatabaseSize() {
    try {
      const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/IntegradorVF.db');
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        return stats.size;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Formatar tamanho em bytes para string legível
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Executar VACUUM para otimizar banco
   */
  vacuum() {
    try {
      const db = this.getConnection();
      db.exec('VACUUM');
      console.log('✅ VACUUM executado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao executar VACUUM:', error);
      throw error;
    }
  }
}

// Exportar singleton
const dbSQLite = new DatabaseSQLite();

module.exports = dbSQLite;