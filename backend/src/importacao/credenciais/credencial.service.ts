// backend/src/importacao/credenciais/credencial.service.ts
import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { SqliteService }                               from '../../database/sqlite.service';
import { AppLoggerService }                            from '../../logger/logger.service';

export interface CredencialVF {
  lojaId:   number;
  urlApi:   string;
  tokenApi: string;
}

/**
 * CredencialService
 *
 * Persiste as credenciais da API Varejo Fácil na tabela `credenciais` do SQLite.
 * A tabela permite apenas uma linha (id = 1 com CHECK constraint), garantindo
 * que o sistema trabalhe sempre com uma única conexão de API por vez.
 *
 * Isso permite que o backend leia as credenciais de forma autônoma para
 * executar jobs de importação — sem depender do browser estar aberto.
 */
@Injectable()
export class CredencialService implements OnModuleInit {

  constructor(
    private readonly sqlite: SqliteService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit() {
    // A tabela já é criada pelo IntegradorDB.sql — apenas valida existência
    this._garantirTabela();
  }

  // ─── API Pública ──────────────────────────────────────────────────────────

  /** Salva (INSERT OR REPLACE) as credenciais. Sempre usa id = 1. */
  salvar(credencial: CredencialVF): { success: boolean } {
    this.sqlite.run(
      `INSERT OR REPLACE INTO credenciais (id, loja_id, url_api, token_api, updated_at)
       VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [credencial.lojaId, credencial.urlApi.trim(), credencial.tokenApi.trim()],
    );
    this.logger.info('Credenciais salvas no banco local', 'CredencialService');
    return { success: true };
  }

  /** Carrega as credenciais salvas. Lança NotFoundException se não existirem. */
  carregar(): CredencialVF {
    const row = this.sqlite.get<{
      loja_id:   number;
      url_api:   string;
      token_api: string;
    }>(`SELECT loja_id, url_api, token_api FROM credenciais WHERE id = 1`);

    if (!row) {
      throw new NotFoundException(
        'Nenhuma credencial configurada. Configure a API Varejo Fácil primeiro.',
      );
    }

    return {
      lojaId:   row.loja_id,
      urlApi:   row.url_api,
      tokenApi: row.token_api,
    };
  }

  /** Retorna as credenciais ou null se não estiverem salvas. */
  carregarOuNull(): CredencialVF | null {
    try {
      return this.carregar();
    } catch {
      return null;
    }
  }

  /** Informa se há credenciais salvas. */
  estaConfigurado(): boolean {
    return !!this.carregarOuNull();
  }

  /** Remove as credenciais. */
  limpar(): { success: boolean } {
    this.sqlite.run(`DELETE FROM credenciais WHERE id = 1`);
    this.logger.info('Credenciais removidas', 'CredencialService');
    return { success: true };
  }

  // ─── Privado ──────────────────────────────────────────────────────────────

  /** Cria a tabela caso o IntegradorDB.sql ainda não tenha rodado. */
  private _garantirTabela(): void {
    this.sqlite.run(`
      CREATE TABLE IF NOT EXISTS credenciais (
        id        INTEGER PRIMARY KEY CHECK (id = 1) DEFAULT 1,
        loja_id   INTEGER NOT NULL,
        url_api   TEXT    NOT NULL,
        token_api TEXT    NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}
