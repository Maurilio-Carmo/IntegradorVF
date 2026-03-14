// backend/src/sincronizacao/sincronizacao.executor.ts
//
// Responsabilidade exclusiva: enviar registros à API externa e atualizar
// o status no SQLite conforme o resultado (S = sucesso, E = erro).
//
// Não conhece NestJS controllers, DTOs nem regras de negócio de domínio.
// Recebe tudo via parâmetros — fácil de testar de forma isolada.

import { Injectable }    from '@nestjs/common';
import { eq }            from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service';
import { AppLoggerService } from '../logger/logger.service';
import {
  ResultadoSync,
  CredencialSync,
  API_TIMEOUT_MS,
  CONCORRENCIA_MAX,
} from './sincronizacao.types';

@Injectable()
export class SincronizacaoExecutor {

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly logger:  AppLoggerService,
  ) {}

  // ─── API Pública ──────────────────────────────────────────────────────────

  /**
   * Processa uma lista de registros com concorrência máxima controlada.
   *
   * Usa semáforo próprio (sem libs externas) para limitar o número de
   * requisições HTTP simultâneas a CONCORRENCIA_MAX.
   */
  async processarEmLote(
    dominio:   string,
    tabela:    any,
    pkField:   any,
    registros: any[],
    cred:      CredencialSync,
    resultado: ResultadoSync,
  ): Promise<void> {
    let slots = CONCORRENCIA_MAX;
    const fila: (() => void)[] = [];

    const adquirir = (): Promise<void> => {
      if (slots > 0) { slots--; return Promise.resolve(); }
      return new Promise(resolve => fila.push(resolve));
    };

    const liberar = (): void => {
      const proximo = fila.shift();
      proximo ? proximo() : slots++;
    };

    await Promise.all(
      registros.map(async (registro) => {
        await adquirir();
        try {
          await this.processarUm(dominio, tabela, pkField, registro, cred, resultado);
        } finally {
          liberar();
        }
      }),
    );
  }

  /**
   * Envia um único registro à API e persiste o novo status no SQLite.
   *
   * Máquina de estados:
   *   C → POST   → res.ok?        → S | E
   *   U → PUT    → res.ok?        → S | E
   *   D → DELETE → ok ou 404?     → S | E
   */
  async processarUm(
    dominio:   string,
    tabela:    any,
    pkField:   any,
    registro:  any,
    cred:      CredencialSync,
    resultado: ResultadoSync,
  ): Promise<void> {
    const pkColumnName = pkField.name as string;
    const pkValue      = registro[pkColumnName];

    if (pkValue === undefined || pkValue === null) {
      this.logger.warn(
        `Registro sem PK legível em ${dominio} (coluna: ${pkColumnName})`,
        'SincronizacaoExecutor',
      );
      resultado.erros++;
      return;
    }

    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);

    const buildOpts = (method: string, body?: object): RequestInit => ({
      method,
      signal: ctrl.signal,
      headers: {
        'x-api-key':    cred.tokenApi,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    try {
      let res: Response;

      if (registro.status === 'C') {
        res = await fetch(`${cred.urlApi}/${dominio}`, buildOpts('POST', registro));
        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ao criar: ${msg.slice(0, 300)}`);
        }
        resultado.criados++;

      } else if (registro.status === 'U') {
        res = await fetch(`${cred.urlApi}/${dominio}/${pkValue}`, buildOpts('PUT', registro));
        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ao atualizar: ${msg.slice(0, 300)}`);
        }
        resultado.atualizados++;

      } else if (registro.status === 'D') {
        res = await fetch(`${cred.urlApi}/${dominio}/${pkValue}`, buildOpts('DELETE'));
        // 404 = já não existe na API → sucesso idempotente
        if (!res.ok && res.status !== 404) {
          const msg = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ao deletar: ${msg.slice(0, 300)}`);
        }
        resultado.deletados++;

      } else {
        this.logger.warn(
          `Status inesperado "${registro.status}" para ${dominio}[${pkValue}] — ignorado`,
          'SincronizacaoExecutor',
        );
        return;
      }

      // API aceitou → marca como sincronizado, limpa retorno anterior
      this.drizzle.db
        .update(tabela)
        .set({ status: 'S', retorno: null } as any)
        .where(eq(pkField, pkValue))
        .run();

    } catch (err: any) {
      resultado.erros++;

      const mensagemErro = err.name === 'AbortError'
        ? `Timeout após ${API_TIMEOUT_MS}ms`
        : (err.message?.substring(0, 500) ?? 'Erro desconhecido');

      this.logger.error(
        `Falha sync ${dominio}[${pkValue}]: ${mensagemErro}`,
        'SincronizacaoExecutor',
      );

      this.drizzle.db
        .update(tabela)
        .set({ retorno: mensagemErro, status: 'E' } as any)
        .where(eq(pkField, pkValue))
        .run();

    } finally {
      clearTimeout(timer);
    }
  }
}
