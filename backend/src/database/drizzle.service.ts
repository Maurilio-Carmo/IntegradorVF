// backend/src/database/drizzle.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle }       from 'drizzle-orm/better-sqlite3';
import Database          from 'better-sqlite3';
import * as path         from 'path';
import * as fs           from 'fs';
import * as schema       from './schema';

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {

  readonly db!: DrizzleDB;
  private _sqlite!: Database.Database;
  private readonly log = new Logger(DrizzleService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const dbPath = this.config.get<string>('DATABASE_PATH')
      ?? path.join(process.cwd(), 'backend', 'database', 'integrador.db');

    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this._sqlite = new Database(dbPath);

    this._sqlite.pragma('journal_mode = WAL');
    this._sqlite.pragma('foreign_keys = ON');
    this._sqlite.pragma('synchronous = NORMAL');
    this._sqlite.pragma('cache_size = -32000');

    (this as any).db = drizzle(this._sqlite, { schema });

    this.log.log(`✅ Drizzle conectado: ${dbPath}`);
  }

  onModuleDestroy(): void {
    this._sqlite?.close();
    this.log.log('🔒 Drizzle desconectado');
  }

  /**
   * Acesso direto ao better-sqlite3 para queries com nomes de tabela
   * dinâmicos que não podem ser expressos como Drizzle schema estático.
   * Use com moderação — prefira sempre o `db` tipado.
   */
  get raw(): Database.Database {
    return this._sqlite;
  }
}
