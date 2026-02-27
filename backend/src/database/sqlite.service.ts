// backend/src/database/sqlite.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database          from 'better-sqlite3';
import * as path         from 'path';
import * as fs           from 'fs';

@Injectable()
export class SqliteService implements OnModuleInit, OnModuleDestroy {
  private db!: Database.Database;
  private readonly log = new Logger(SqliteService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const dbPath = this.config.get<string>('DATABASE_PATH')
      ?? path.join(process.cwd(), 'backend', 'database', 'integrador.db');

    // Garante que a pasta existe antes de abrir o arquivo
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);

    // Performance básica recomendada para SQLite
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.log.log(`✅ SQLite conectado: ${dbPath}`);
  }

  onModuleDestroy(): void {
    this.db?.close();
    this.log.log('🔒 SQLite desconectado');
  }

  /** Retorna a instância raw para uso nos repositórios */
  getDb(): Database.Database {
    return this.db;
  }

  /** Executa uma query SELECT e retorna array de resultados */
  query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  /** Executa INSERT / UPDATE / DELETE */
  run(sql: string, params: unknown[] = []): Database.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  /** Executa uma query que retorna apenas 1 linha */
  get<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }
}