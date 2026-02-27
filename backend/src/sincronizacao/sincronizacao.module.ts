// backend/src/sincronizacao/sincronizacao.module.ts
import { Module }                    from '@nestjs/common';
import { SincronizacaoController }   from './sincronizacao.controller';
import { SincronizacaoService }      from './sincronizacao.service';

/**
 * Módulo de sincronização bidirecional SQLite ↔ API.
 * Motor principal — funcionalidade nova, sem equivalente no Express legado.
 *
 * Fluxo de status:
 *   C (Create)   → POST na API → S (Sucesso) ou E (Erro)
 *   U (Update)   → PUT  na API → S (Sucesso) ou E (Erro)
 *   D (Delete)   → DELETE na API → S (Sucesso) ou E (Erro)
 *   S (Sincronizado) — estado final OK
 *   E (Erro) → pode ser reprocessado via /reprocessar/:dominio/:id
 */
@Module({
  controllers: [SincronizacaoController],
  providers:   [SincronizacaoService],
})
export class SincronizacaoModule {}
