// backend/src/database/sqlite.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as BetterSqlite3 from 'better-sqlite3';
import * as path         from 'path';
import * as fs           from 'fs';

const Database = (BetterSqlite3 as any).default ?? BetterSqlite3;
@Injectable()
export class SqliteService implements OnModuleInit, OnModuleDestroy {
  private db!: BetterSqlite3.Database;
  private readonly log = new Logger(SqliteService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const dbPath = this.config.get<string>('DATABASE_PATH')
      ?? path.join(process.cwd(), 'backend', 'database', 'integrador.db');

    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.log.log(`✅ SQLite conectado: ${dbPath}`);
  }

  onModuleDestroy(): void {
    this.db?.close();
    this.log.log('🔒 SQLite desconectado');
  }

  /** Retorna a instância raw do banco */
  getDb(): BetterSqlite3.Database {
    return this.db;
  }

  /** SELECT — retorna array de resultados */
  query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  /** INSERT / UPDATE / DELETE */
  run(sql: string, params: unknown[] = []): BetterSqlite3.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  /** SELECT — retorna apenas 1 linha */
  get<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  /**
   * Executa um conjunto de operações em uma transação atômica.
   * Se qualquer operação falhar, tudo é revertido automaticamente.
   *
   * @example
   * this.sqlite.transaction(() => {
   *   this.sqlite.run('DELETE FROM tabela_a');
   *   this.sqlite.run('DELETE FROM tabela_b');
   * });
   */
  transaction(fn: () => void): void {
    const txn = this.db.transaction(fn);
    txn();
  }

  /**
   * Executa um conjunto de operações em transação e retorna um valor.
   * Útil quando a função precisa retornar dados após a transação.
   */
  transactionWith<T>(fn: () => T): T {
    const txn = this.db.transaction(fn);
    return txn();
  }
}