// backend/src/database-control/database-control.service.ts
import { Injectable, Logger }  from '@nestjs/common';
import { SqliteService }        from '../database/sqlite.service';
import { AppLoggerService }     from '../logger/logger.service';
import * as fs   from 'fs';
import * as path from 'path';

/**
 * Serviço de controle estrutural do banco SQLite.
 * Responsável por: criar tabelas via SQL, limpar dados e executar reset completo.
 */
@Injectable()
export class DatabaseControlService {
  private readonly log = new Logger(DatabaseControlService.name);

  private readonly TABELAS = [
    'secoes', 'grupos', 'subgrupos', 'marcas', 'familias',
    'produtos', 'produto_auxiliares', 'produto_fornecedores',
    'categorias', 'agentes', 'contas_correntes',
    'especies_documentos', 'historico_padrao',
    'formas_pagamento', 'pagamentos_pdv', 'recebimentos_pdv',
    'motivos_desconto', 'motivos_devolucao', 'motivos_cancelamento',
    'local_estoque', 'tipos_ajustes', 'saldo_estoque',
    'regime_tributario', 'situacoes_fiscais', 'tipos_operacoes',
    'impostos_federais', 'tabelas_tributarias', 'cenarios_fiscais',
    'lojas', 'clientes', 'fornecedores',
    'sync_historico',
  ];

  constructor(
    private readonly sqlite: SqliteService,
    private readonly logger: AppLoggerService,
  ) {}

  /** Executa o IntegradorDB.sql — idempotente (IF NOT EXISTS) */
  async criarTabelas() {
    const sqlPath = path.join(process.cwd(), 'backend', 'database', 'IntegradorDB.sql');
    const sql     = fs.readFileSync(sqlPath, 'utf8');

    let criadas    = 0;
    const erros: string[] = [];

    sql.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .forEach(stmt => {
        try {
          this.sqlite.run(stmt);
          if (stmt.toUpperCase().startsWith('CREATE')) criadas++;
        } catch (err: any) {
          if (!err.message?.includes('already exists')) {
            erros.push(err.message);
          }
        }
      });

    // Tabela de histórico — pode não estar no SQL original
    this.sqlite.run(`
      CREATE TABLE IF NOT EXISTS sync_historico (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        dominio      TEXT NOT NULL,
        resultado    TEXT,
        duracao_ms   INTEGER,
        executado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // CORREÇÃO: success() agora existe no AppLoggerService
    this.logger.success(`Banco criado: ${criadas} tabelas`, 'DatabaseControl');
    return { success: true, tabelas_criadas: criadas, erros };
  }

  /** Apaga todos os registros mantendo a estrutura */
  async limparDados() {
    let limpas = 0;

    // CORREÇÃO: sqlite.transaction() agora existe no SqliteService
    this.sqlite.transaction(() => {
      this.TABELAS.forEach(tabela => {
        try {
          this.sqlite.run(`DELETE FROM ${tabela}`);
          limpas++;
        } catch { /* tabela pode não existir ainda */ }
      });
    });

    this.logger.info(`Dados limpos: ${limpas} tabelas`, 'DatabaseControl');
    return { success: true, tabelas_limpas: limpas };
  }

  /** DROP + CREATE — reinicia completamente o banco */
  async resetCompleto() {
    this.TABELAS.forEach(tabela => {
      try { this.sqlite.run(`DROP TABLE IF EXISTS ${tabela}`); } catch {}
    });

    this.logger.warn('Reset completo executado — recriando banco...', 'DatabaseControl');
    return this.criarTabelas();
  }

  /** Retorna contagem de registros por tabela */
  async obterEstatisticas() {
    const stats: Record<string, any> = {};

    for (const tabela of this.TABELAS) {
      try {
        const row = this.sqlite.get<{ total: number }>(
          `SELECT COUNT(*) as total FROM ${tabela}`
        );
        stats[tabela] = row?.total ?? 0;
      } catch {
        stats[tabela] = null; // tabela ainda não existe
      }
    }

    return { timestamp: new Date().toISOString(), tabelas: stats };
  }
}