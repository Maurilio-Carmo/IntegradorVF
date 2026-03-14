// backend/src/sincronizacao/sincronizacao.module.ts
import { Module }                  from '@nestjs/common';
import { SincronizacaoController } from './sincronizacao.controller';
import { SincronizacaoService }    from './sincronizacao.service';
import { SincronizacaoExecutor }   from './sincronizacao.executor';
import { CredencialModule }        from '../importacao/module/credencial.module';

/**
 * Módulo de sincronização SQLite → API externa.
 *
 * Arquivos do módulo:
 *   sincronizacao.types.ts    — tipos e constantes
 *   sincronizacao.registry.ts — mapa domínio → tabela/PK (fonte única de verdade)
 *   sincronizacao.executor.ts — lógica HTTP + persistência de status
 *   sincronizacao.service.ts  — orquestração e API pública
 *   sincronizacao.controller.ts — endpoints REST
 */
@Module({
  imports:     [CredencialModule],
  controllers: [SincronizacaoController],
  providers:   [SincronizacaoService, SincronizacaoExecutor],
})
export class SincronizacaoModule {}
