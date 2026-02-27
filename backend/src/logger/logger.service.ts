// backend/src/logger/logger.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SqliteService } from '../database/sqlite.service';

export type LogLevel = 'info' | 'warn' | 'error';

@Injectable()
export class AppLoggerService implements OnModuleInit {
  private readonly nestLogger = new Logger('AppLogger');

  constructor(private readonly sqlite: SqliteService) {}

  onModuleInit(): void {
    // Cria tabela de logs se não existir
    this.sqlite.run(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        level      TEXT    NOT NULL DEFAULT 'info',
        modulo     TEXT,
        mensagem   TEXT    NOT NULL,
        detalhes   TEXT,
        criado_em  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
      )
    `);
  }

  info(mensagem: string, modulo?: string, detalhes?: unknown): void {
    this.nestLogger.log(`[${modulo ?? 'APP'}] ${mensagem}`);
    this.persist('info', mensagem, modulo, detalhes);
  }

  warn(mensagem: string, modulo?: string, detalhes?: unknown): void {
    this.nestLogger.warn(`[${modulo ?? 'APP'}] ${mensagem}`);
    this.persist('warn', mensagem, modulo, detalhes);
  }

  error(mensagem: string, modulo?: string, detalhes?: unknown): void {
    this.nestLogger.error(`[${modulo ?? 'APP'}] ${mensagem}`);
    this.persist('error', mensagem, modulo, detalhes);
  }

  /** Retorna últimos N logs (padrão 100) */
  getLogs(limit = 100, level?: LogLevel): unknown[] {
    const sql = level
      ? `SELECT * FROM sync_logs WHERE level = ? ORDER BY id DESC LIMIT ?`
      : `SELECT * FROM sync_logs ORDER BY id DESC LIMIT ?`;

    const params = level ? [level, limit] : [limit];
    return this.sqlite.query(sql, params);
  }

  /** Remove logs mais antigos que N dias */
  limpar(dias = 30): void {
    this.sqlite.run(
      `DELETE FROM sync_logs WHERE criado_em < datetime('now', '-${dias} days')`
    );
    this.info(`Logs com mais de ${dias} dias removidos`, 'Logger');
  }

  private persist(level: LogLevel, mensagem: string, modulo?: string, detalhes?: unknown): void {
    try {
      this.sqlite.run(
        `INSERT INTO sync_logs (level, modulo, mensagem, detalhes) VALUES (?, ?, ?, ?)`,
        [level, modulo ?? null, mensagem, detalhes ? JSON.stringify(detalhes) : null]
      );
    } catch {
      // Nunca lançar erro dentro do logger para não criar loop
    }
  }
}