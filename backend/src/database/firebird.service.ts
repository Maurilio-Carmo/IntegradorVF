// backend/src/database/firebird.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Firebird     from 'node-firebird';

@Injectable()
export class FirebirdService implements OnModuleInit, OnModuleDestroy {
  private pool!: Firebird.ConnectionPool;
  private readonly log = new Logger(FirebirdService.name);
  private options!: Firebird.Options;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.options = {
      host:           this.config.get<string>('FB_HOST',     '127.0.0.1'),
      port:           this.config.get<number>('FB_PORT',     3050),
      database:       this.config.get<string>('FB_DATABASE', ''),
      user:           this.config.get<string>('FB_USER',     'SYSDBA'),
      password:       this.config.get<string>('FB_PASSWORD', 'masterkey'),
      charset:        this.config.get<string>('FB_CHARSET',  'UTF8'),
      lowercase_keys: false,
      role:           undefined,
      pageSize:       4096,
    };

    if (!this.options.database) {
      this.log.warn('⚠️  FB_DATABASE não configurado — Firebird desabilitado');
      return;
    }

    const poolSize = this.config.get<number>('FB_POOL_SIZE', 5);
    this.pool = Firebird.pool(poolSize, this.options);
    this.log.log(`✅ Firebird pool criado (${poolSize} conex.): ${this.options.database}`);
  }

  onModuleDestroy(): void {
    this.pool?.destroy();
    this.log.log('🔒 Firebird pool destruído');
  }

  /** Verifica se o Firebird está configurado e acessível */
  isEnabled(): boolean {
    return !!this.pool && !!this.options?.database;
  }

  /**
   * Testa a conectividade com o banco Firebird.
   * Retorna objeto com status, versão do servidor e tempo de resposta.
   */
  testConnection(): Promise<{ connected: boolean; host: string; database: string; responseMs: number; error?: string }> {
    const start = Date.now();
    const info  = { host: this.options?.host ?? '', database: this.options?.database ?? '' };

    if (!this.isEnabled()) {
      return Promise.resolve({
        connected:  false,
        ...info,
        responseMs: 0,
        error:      'FB_DATABASE não configurado no .env',
      });
    }

    return new Promise((resolve) => {
      this.pool.get((err, db) => {
        if (err) {
          return resolve({
            connected:  false,
            ...info,
            responseMs: Date.now() - start,
            error:      err.message,
          });
        }

        // Consulta mínima para validar a conexão
        db.query('SELECT 1 FROM RDB$DATABASE', [], (qErr) => {
          db.detach();
          resolve({
            connected:  !qErr,
            ...info,
            responseMs: Date.now() - start,
            ...(qErr ? { error: qErr.message } : {}),
          });
        });
      });
    });
  }

  /** Executa SELECT e retorna array de resultados */
  query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled()) return resolve([]);

      this.pool.get((err, db) => {
        if (err) return reject(err);

        db.query(sql, params, (qErr, result) => {
          db.detach();
          if (qErr) return reject(qErr);
          resolve((result ?? []) as T[]);
        });
      });
    });
  }

  /** Executa DML (INSERT / UPDATE / DELETE) */
  execute(sql: string, params: unknown[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled()) return resolve();

      this.pool.get((err, db) => {
        if (err) return reject(err);

        db.query(sql, params, (qErr) => {
          db.detach();
          if (qErr) return reject(qErr);
          resolve();
        });
      });
    });
  }
}