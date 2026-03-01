// backend/src/logger/logger.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SqliteService } from '../database/sqlite.service';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

@Injectable()
export class  AppLoggerService implements OnModuleInit {
  private readonly nestLogger = new Logger('AppLogger');

  constructor(private readonly sqlite: SqliteService) {}

  onModuleInit(): void {
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

  info(mensagem: string, moduloOuDetalhes?: string | unknown, detalhes?: unknown): void {
    const { modulo, det } = this.parseArgs(moduloOuDetalhes, detalhes);
    this.nestLogger.log(`[${modulo}] ${mensagem}`);
    this.persist('info', mensagem, modulo, det);
  }

  warn(mensagem: string, moduloOuDetalhes?: string | unknown, detalhes?: unknown): void {
    const { modulo, det } = this.parseArgs(moduloOuDetalhes, detalhes);
    this.nestLogger.warn(`[${modulo}] ${mensagem}`);
    this.persist('warn', mensagem, modulo, det);
  }

  error(mensagem: string, moduloOuDetalhes?: string | unknown, detalhes?: unknown): void {
    const { modulo, det } = this.parseArgs(moduloOuDetalhes, detalhes);
    this.nestLogger.error(`[${modulo}] ${mensagem}`);
    this.persist('error', mensagem, modulo, det);
  }

  /**
   * Nível 'success' — alias de info com marcador visual.
   * Aceita (mensagem) ou (mensagem, detalhes) ou (mensagem, modulo, detalhes).
   */
  success(mensagem: string, moduloOuDetalhes?: string | unknown, detalhes?: unknown): void {
    const { modulo, det } = this.parseArgs(moduloOuDetalhes, detalhes);
    this.nestLogger.log(`✅ [${modulo}] ${mensagem}`);
    this.persist('success', mensagem, modulo, det);
  }

  /** Retorna últimos N logs, filtrável por level */
  getLogs(limit = 100, level?: LogLevel): unknown[] {
    if (level) {
      return this.sqlite.query(
        `SELECT * FROM sync_logs WHERE level = ? ORDER BY id DESC LIMIT ?`,
        [level, limit]
      );
    }
    return this.sqlite.query(
      `SELECT * FROM sync_logs ORDER BY id DESC LIMIT ?`,
      [limit]
    );
  }

  /** Remove logs com mais de N dias */
  limpar(dias = 30): void {
    this.sqlite.run(
      `DELETE FROM sync_logs WHERE criado_em < datetime('now', '-${dias} days')`
    );
    this.info(`Logs com mais de ${dias} dias removidos`, 'Logger');
  }

  // ─── helpers privados ────────────────────────────────────────────────────────

  /**
   * Interpreta os argumentos opcionais de forma flexível:
   *   .info(msg, 'NomeModulo', { dado })  → modulo='NomeModulo', det={dado}
   *   .info(msg, { dado })                → modulo='APP',        det={dado}
   *   .info(msg)                          → modulo='APP',        det=undefined
   */
  private parseArgs(
    moduloOuDetalhes?: string | unknown,
    detalhes?: unknown,
  ): { modulo: string; det: unknown } {
    if (typeof moduloOuDetalhes === 'string') {
      return { modulo: moduloOuDetalhes, det: detalhes };
    }
    if (moduloOuDetalhes !== undefined) {
      return { modulo: 'APP', det: moduloOuDetalhes };
    }
    return { modulo: 'APP', det: undefined };
  }

  private persist(level: LogLevel, mensagem: string, modulo: string, detalhes?: unknown): void {
    try {
      this.sqlite.run(
        `INSERT INTO sync_logs (level, modulo, mensagem, detalhes) VALUES (?, ?, ?, ?)`,
        [level, modulo, mensagem, detalhes ? JSON.stringify(detalhes) : null]
      );
    } catch {
      // Nunca lançar erro dentro do logger para não criar loop
    }
  }
}