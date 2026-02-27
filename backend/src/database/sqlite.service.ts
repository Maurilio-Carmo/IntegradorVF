// backend/src/database/sqlite.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database          from 'better-sqlite3';
import * as path         from 'path';

/**
 * Serviço de acesso ao SQLite local via better-sqlite3.
 * Expõe métodos síncronos de query, get e run — ideal para operações em lote.
 * Inicializa e fecha a conexão automaticamente com o ciclo de vida do módulo.
 */
@Injectable()
export class SqliteService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;
  private readonly log = new Logger(SqliteService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const dbPath = this.config.get<string>('DATABASE_PATH')
      ?? path.join(process.cwd(), 'backend', 'database', 'integrador.db');

    this.db = new Database(dbPath);

    // WAL: melhor performance para leitura/escrita concorrente
    this.db.pragma('journal_mode = WAL');
    // Garante integridade referencial
    this.db.pragma('foreign_keys = ON');

    this.log.log(`✅ SQLite conectado: ${dbPath}`);
  }

  onModuleDestroy() {
    this.db?.close();
    this.log.log('🔌 SQLite desconectado');
  }

  /** Retorna múltiplos registros */
  query<T = any>(sql: string, params: any[] = []): T[] {
    try {
      return this.db.prepare(sql).all(...params) as T[];
    } catch (err) {
      this.log.error(`SQL Error: ${sql}`, err.message);
      throw err;
    }
  }

  /** Retorna um único registro */
  get<T = any>(sql: string, params: any[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T;
  }

  /** Executa INSERT / UPDATE / DELETE */
  run(sql: string, params: any[] = []) {
    return this.db.prepare(sql).run(...params);
  }

  /** Executa múltiplas operações em uma única transação atômica */
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  /** Acesso direto à instância Database (uso avançado) */
  raw(): Database.Database {
    return this.db;
  }
}
