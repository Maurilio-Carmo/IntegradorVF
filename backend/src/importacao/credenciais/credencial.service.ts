// backend/src/importacao/credenciais/credencial.service.ts
import { Injectable, Logger }  from '@nestjs/common';
import { eq }                  from 'drizzle-orm';
import { DrizzleService }      from '../../database/drizzle.service';
import { credenciais }         from '../../database/schema';

export interface CredencialVF {
  lojaId:   number;
  urlApi:   string;
  tokenApi: string;
}

@Injectable()
export class CredencialService {

  private readonly log = new Logger(CredencialService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  /** Retorna a credencial ou lança erro se não configurada */
  carregar(): CredencialVF {
    const row = this.drizzle.db
      .select()
      .from(credenciais)
      .where(eq(credenciais.id, 1))
      .get();

    if (!row) throw new Error('Credenciais não configuradas.');

    return { lojaId: row.lojaId, urlApi: row.urlApi, tokenApi: row.tokenApi };
  }

  /** Retorna a credencial ou NULL (sem lançar exceção) */
  carregarOuNull(): CredencialVF | null {
    try {
      const row = this.drizzle.db
        .select()
        .from(credenciais)
        .where(eq(credenciais.id, 1))
        .get();

      if (!row) return null;

      return { lojaId: row.lojaId, urlApi: row.urlApi, tokenApi: row.tokenApi };
    } catch {
      return null;
    }
  }

  estaConfigurado(): boolean {
    try {
      const row = this.drizzle.db
        .select({ id: credenciais.id })
        .from(credenciais)
        .where(eq(credenciais.id, 1))
        .get();
      return !!row;
    } catch {
      return false;
    }
  }

  /** Aceita objeto (novo padrão) ou 3 argumentos separados (legado) */
  salvar(dados: { lojaId: number; urlApi: string; tokenApi: string }): void {
    const { lojaId, urlApi, tokenApi } = dados;

    this.drizzle.db
      .insert(credenciais)
      .values({ id: 1, lojaId, urlApi, tokenApi })
      .onConflictDoUpdate({
        target: credenciais.id,
        set:    { lojaId, urlApi, tokenApi },
      })
      .run();

    this.log.log('Credenciais salvas');
  }

  /** Remove as credenciais salvas */
  limpar(): { success: boolean } {
    this.drizzle.db
      .delete(credenciais)
      .where(eq(credenciais.id, 1))
      .run();

    this.log.log('Credenciais removidas');
    return { success: true };
  }
}