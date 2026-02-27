// backend/src/config/database-firebird.js

const Firebird = require('node-firebird');

/**
 * Classe de conexão com Firebird 2.5
 * Gerencia conexão, queries e transações com banco Firebird
 */
class DatabaseFirebird {
  constructor() {
    this.pool = null;
    this.config = {
      host: process.env.FIREBIRD_HOST || 'localhost',
      port: parseInt(process.env.FIREBIRD_PORT) || 3050,
      database: process.env.FIREBIRD_DATABASE || 'C:/databases/database.fdb',
      user: process.env.FIREBIRD_USER || 'SYSDBA',
      password: process.env.FIREBIRD_PASSWORD || 'masterkey',
      lowercase_keys: false,
      role: null,
      pageSize: 4096,
      retryConnectionInterval: 1000,
      blobAsText: false
    };
  }

  /**
   * Conectar ao banco de dados Firebird usando pool de conexões
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Criar pool de conexões
        this.pool = Firebird.pool(5, this.config);

        console.log('✅ Pool de conexões Firebird criado');
        console.log(`📍 Host: ${this.config.host}:${this.config.port}`);
        console.log(`📍 Database: ${this.config.database}`);

        // Testar conexão
        this.pool.get((err, db) => {
          if (err) {
            console.error('❌ Erro ao conectar com Firebird:', err);
            reject(err);
            return;
          }

          console.log('✅ Conexão Firebird testada com sucesso');
          db.detach();
          resolve(this.pool);
        });

      } catch (error) {
        console.error('❌ Erro ao criar pool Firebird:', error);
        reject(error);
      }
    });
  }

  /**
   * Obter conexão do pool
   */
  getConnection() {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        reject(new Error('Pool não inicializado. Execute connect() primeiro.'));
        return;
      }

      this.pool.get((err, db) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(db);
      });
    });
  }

  /**
   * Fechar pool de conexões
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.pool) {
        this.pool.destroy((err) => {
          if (err) {
            console.error('❌ Erro ao fechar pool Firebird:', err);
            reject(err);
            return;
          }
          this.pool = null;
          console.log('🔌 Pool de conexões Firebird fechado');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Executar query SELECT (retorna múltiplas linhas)
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Array>} Resultados
   */
  query(sql, params = []) {
    return new Promise(async (resolve, reject) => {
      let db = null;
      
      try {
        db = await this.getConnection();
        
        db.query(sql, params, (err, result) => {
          if (err) {
            console.error('❌ Erro ao executar query:', err);
            db.detach();
            reject(err);
            return;
          }
          
          db.detach();
          resolve(result);
        });
      } catch (error) {
        if (db) db.detach();
        reject(error);
      }
    });
  }

  /**
   * Executar query SELECT (retorna uma única linha)
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Object|null>} Resultado
   */
  async get(sql, params = []) {
    try {
      const results = await this.query(sql, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('❌ Erro ao buscar registro:', error);
      throw error;
    }
  }

  /**
   * Executar comando INSERT, UPDATE, DELETE
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Object>} Resultado da execução
   */
  run(sql, params = []) {
    return new Promise(async (resolve, reject) => {
      let db = null;
      
      try {
        db = await this.getConnection();
        
        db.query(sql, params, (err, result) => {
          if (err) {
            console.error('❌ Erro ao executar comando:', err);
            db.detach();
            reject(err);
            return;
          }
          
          db.detach();
          resolve(result);
        });
      } catch (error) {
        if (db) db.detach();
        reject(error);
      }
    });
  }

  /**
   * Executar múltiplos comandos em uma transação
   * @param {Function} callback - Função async com operações do banco
   * @returns {Promise} Resultado da transação
   */
  transaction(callback) {
    return new Promise(async (resolve, reject) => {
      let db = null;
      
      try {
        db = await this.getConnection();
        
        db.transaction(Firebird.ISOLATION_READ_COMMITED, async (err, transaction) => {
          if (err) {
            console.error('❌ Erro ao iniciar transação:', err);
            db.detach();
            reject(err);
            return;
          }

          try {
            const result = await callback(transaction);
            
            transaction.commit((err) => {
              if (err) {
                console.error('❌ Erro ao fazer commit:', err);
                db.detach();
                reject(err);
                return;
              }
              
              db.detach();
              resolve(result);
            });
          } catch (error) {
            transaction.rollback((err) => {
              if (err) {
                console.error('❌ Erro ao fazer rollback:', err);
              }
              db.detach();
              reject(error);
            });
          }
        });
      } catch (error) {
        if (db) db.detach();
        reject(error);
      }
    });
  }

  /**
   * Executar INSERT em lote usando stored procedure (mais eficiente)
   * @param {string} sql - Query SQL preparada
   * @param {Array} rows - Array de arrays com valores
   */
  async bulkInsert(sql, rows) {
    return new Promise(async (resolve, reject) => {
      let db = null;
      
      try {
        db = await this.getConnection();
        let insertedCount = 0;

        db.transaction(Firebird.ISOLATION_READ_COMMITED, async (err, transaction) => {
          if (err) {
            console.error('❌ Erro ao iniciar transação:', err);
            db.detach();
            reject(err);
            return;
          }

          try {
            // Executar inserts em lote
            for (const row of rows) {
              await new Promise((resolveInsert, rejectInsert) => {
                transaction.query(sql, row, (err) => {
                  if (err) {
                    rejectInsert(err);
                    return;
                  }
                  insertedCount++;
                  resolveInsert();
                });
              });
            }

            transaction.commit((err) => {
              if (err) {
                console.error('❌ Erro ao fazer commit:', err);
                db.detach();
                reject(err);
                return;
              }
              
              console.log(`✅ Inseridos ${insertedCount} registros`);
              db.detach();
              resolve({ insertedCount });
            });
          } catch (error) {
            transaction.rollback((err) => {
              if (err) {
                console.error('❌ Erro ao fazer rollback:', err);
              }
              db.detach();
              reject(error);
            });
          }
        });
      } catch (error) {
        if (db) db.detach();
        reject(error);
      }
    });
  }

  /**
   * Executar stored procedure
   * @param {string} procedureName - Nome da procedure
   * @param {Array} params - Parâmetros
   * @returns {Promise<Array>} Resultados
   */
  async executeProcedure(procedureName, params = []) {
    const placeholders = params.map(() => '?').join(', ');
    const sql = `EXECUTE PROCEDURE ${procedureName}(${placeholders})`;
    return await this.query(sql, params);
  }

  /**
   * Verificar se tabela existe
   * @param {string} tableName - Nome da tabela
   * @returns {Promise<boolean>}
   */
  async tableExists(tableName) {
    try {
      const result = await this.get(
        `SELECT RDB$RELATION_NAME FROM RDB$RELATIONS WHERE RDB$RELATION_NAME = ? AND RDB$SYSTEM_FLAG = 0`,
        [tableName.toUpperCase()]
      );
      return !!result;
    } catch (error) {
      console.error('❌ Erro ao verificar tabela:', error);
      return false;
    }
  }

  /**
   * Obter lista de todas as tabelas
   * @returns {Promise<Array>} Lista de nomes de tabelas
   */
  async getTables() {
    try {
      const tables = await this.query(
        `SELECT TRIM(RDB$RELATION_NAME) AS TABLE_NAME 
         FROM RDB$RELATIONS 
         WHERE RDB$SYSTEM_FLAG = 0 AND RDB$VIEW_BLR IS NULL
         ORDER BY RDB$RELATION_NAME`
      );
      return tables.map(t => t.TABLE_NAME);
    } catch (error) {
      console.error('❌ Erro ao obter tabelas:', error);
      return [];
    }
  }

  /**
   * Obter estrutura de uma tabela
   * @param {string} tableName - Nome da tabela
   * @returns {Promise<Array>} Colunas da tabela
   */
  async getTableSchema(tableName) {
    try {
      const columns = await this.query(
        `SELECT 
          TRIM(RF.RDB$FIELD_NAME) AS FIELD_NAME,
          TRIM(F.RDB$FIELD_TYPE) AS FIELD_TYPE,
          F.RDB$FIELD_LENGTH AS FIELD_LENGTH,
          RF.RDB$NULL_FLAG AS NOT_NULL
         FROM RDB$RELATION_FIELDS RF
         JOIN RDB$FIELDS F ON RF.RDB$FIELD_SOURCE = F.RDB$FIELD_NAME
         WHERE RF.RDB$RELATION_NAME = ?
         ORDER BY RF.RDB$FIELD_POSITION`,
        [tableName.toUpperCase()]
      );
      return columns;
    } catch (error) {
      console.error('❌ Erro ao obter estrutura da tabela:', error);
      return [];
    }
  }

  /**
   * Contar registros em uma tabela
   * @param {string} tableName - Nome da tabela
   * @returns {Promise<number>} Total de registros
   */
  async count(tableName) {
    try {
      const result = await this.get(`SELECT COUNT(*) AS TOTAL FROM ${tableName}`);
      return result ? result.TOTAL : 0;
    } catch (error) {
      console.error(`❌ Erro ao contar registros em ${tableName}:`, error);
      return 0;
    }
  }

  /**
   * Limpar todos os dados de uma tabela
   * @param {string} tableName - Nome da tabela
   */
  async truncate(tableName) {
    try {
      await this.run(`DELETE FROM ${tableName}`);
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
  async backup(backupPath) {
    return new Promise((resolve, reject) => {
      Firebird.backup({
        ...this.config,
        backupPath: backupPath
      }, (err) => {
        if (err) {
          console.error('❌ Erro ao criar backup:', err);
          reject(err);
          return;
        }
        console.log(`💾 Backup criado: ${backupPath}`);
        resolve();
      });
    });
  }

  /**
   * Restaurar backup do banco de dados
   * @param {string} backupPath - Caminho do backup
   */
  async restore(backupPath) {
    return new Promise((resolve, reject) => {
      Firebird.restore({
        ...this.config,
        backupPath: backupPath
      }, (err) => {
        if (err) {
          console.error('❌ Erro ao restaurar backup:', err);
          reject(err);
          return;
        }
        console.log(`♻️ Backup restaurado: ${backupPath}`);
        resolve();
      });
    });
  }

  /**
   * Obter informações do banco de dados
   * @returns {Promise<Object>} Informações do banco
   */
  async getInfo() {
    try {
      const tables = await this.getTables();
      const info = {
        host: this.config.host,
        database: this.config.database,
        tables: tables.length,
        tableNames: tables,
        details: {}
      };

      // Contar registros em cada tabela (pode demorar em bancos grandes)
      for (const table of tables) {
        try {
          info.details[table] = await this.count(table);
        } catch (error) {
          info.details[table] = 'Erro ao contar';
        }
      }

      return info;
    } catch (error) {
      console.error('❌ Erro ao obter informações:', error);
      throw error;
    }
  }

  /**
   * Obter versão do Firebird
   * @returns {Promise<string>} Versão do servidor
   */
  async getVersion() {
    try {
      const result = await this.get('SELECT rdb$get_context(\'SYSTEM\', \'ENGINE_VERSION\') AS VERSION FROM RDB$DATABASE');
      return result ? result.VERSION : 'Desconhecida';
    } catch (error) {
      console.error('❌ Erro ao obter versão:', error);
      return 'Erro';
    }
  }
}

// Exportar singleton
const dbFirebird = new DatabaseFirebird();

module.exports = dbFirebird;