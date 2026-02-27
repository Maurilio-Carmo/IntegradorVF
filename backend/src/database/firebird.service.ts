// backend/src/database/firebird.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService }      from '@nestjs/config';
import * as Firebird          from 'node-firebird';

/**
 * Serviço de acesso ao Firebird 2.5 via node-firebird.
 * Usa o padrão callback→Promise para cada query.
 * Cada chamada abre e fecha a conexão de forma isolada (stateless).
 */
@Injectable()
export class FirebirdService {
  private readonly log = new Logger(FirebirdService.name);
  private options: any;

  constructor(private readonly config: ConfigService) {
    this.options = {
      host:           this.config.get('FIREBIRD_HOST',     'localhost'),
      port:           parseInt(this.config.get('FIREBIRD_PORT', '3050')),
      database:       this.config.get('FIREBIRD_DATABASE', ''),
      user:           this.config.get('FIREBIRD_USER',     'SYSDBA'),
      password:       this.config.get('FIREBIRD_PASSWORD', 'masterkey'),
      lowercase_keys: true,    // retorna colunas em minúsculas
    };
  }

  /** Executa uma query e retorna array de resultados */
  query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      Firebird.attach(this.options, (err, db) => {
        if (err) return reject(new Error(`Firebird connect: ${err.message}`));

        db.query(sql, params, (err, result) => {
          db.detach(); // sempre fecha a conexão
          if (err) reject(new Error(`Firebird query: ${err.message}`));
          else     resolve((result ?? []) as T[]);
        });
      });
    });
  }

  /** Retorna o primeiro registro ou null */
  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  /** Testa a conexão com o banco Firebird */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      await this.query('SELECT 1 FROM RDB$DATABASE');
      return { connected: true, message: 'Conexão estabelecida com sucesso' };
    } catch (err) {
      this.log.warn(`Firebird não disponível: ${err.message}`);
      return { connected: false, message: err.message };
    }
  }
}
