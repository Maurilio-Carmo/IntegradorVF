// backend/src/logger/logger.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { eq, desc, lt, sql }               from 'drizzle-orm';
import { DrizzleService }                  from '../database/drizzle.service';
import { syncLogs }                        from '../database/schema';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

@Injectable()
export class AppLoggerService implements OnModuleInit {

  private readonly nestLogger = new Logger('AppLogger');

  constructor(private readonly drizzle: DrizzleService) {}

  onModuleInit(): void {
  }

  // ─── API Pública ──────────────────────────────────────────────────────────

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

  /** Nível 'success' — alias de info com marcador visual. */
  success(mensagem: string, moduloOuDetalhes?: string | unknown, detalhes?: unknown): void {
    const { modulo, det } = this.parseArgs(moduloOuDetalhes, detalhes);
    this.nestLogger.log(`✅ [${modulo}] ${mensagem}`);
    this.persist('success', mensagem, modulo, det);
  }

  /** Retorna últimos N logs, filtrável por level. */
  getLogs(limit = 100, level?: LogLevel): unknown[] {
    try {
      const query = this.drizzle.db
        .select()
        .from(syncLogs)
        .orderBy(desc(syncLogs.id))
        .limit(limit);

      if (level) {
        return query.where(eq(syncLogs.level, level)).all();
      }

      return query.all();
    } catch {
      return [];
    }
  }

  /** Remove logs com mais de N dias. */
  limpar(dias = 30): void {
    try {
      this.drizzle.db
        .delete(syncLogs)
        .where(
          lt(
            syncLogs.criadoEm,
            sql`datetime('now', '-${sql.raw(String(dias))} days')`,
          ),
        )
        .run();

      this.info(`Logs com mais de ${dias} dias removidos`, 'Logger');
    } catch {
      // silencioso
    }
  }

  // ─── Privado ──────────────────────────────────────────────────────────────

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

  /** Persiste log no SQLite via Drizzle. Nunca lança erro (evita loop). */
  private persist(
    level:    LogLevel,
    mensagem: string,
    modulo:   string,
    detalhes?: unknown,
  ): void {
    try {
      this.drizzle.db
        .insert(syncLogs)
        .values({
          level,
          modulo,
          mensagem,
          detalhes: detalhes ? JSON.stringify(detalhes) : null,
        })
        .run();
    } catch {
      // Nunca lançar erro dentro do logger — evita loop infinito
    }
  }
}
