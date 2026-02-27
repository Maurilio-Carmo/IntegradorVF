// backend/src/proxy/proxy.module.ts
import { Module }          from '@nestjs/common';
import { ProxyController } from './proxy.controller';

/**
 * Módulo de proxy transparente para a API Varejo Fácil.
 * Repassa todas as requisições recebidas em /api/vf/* para o endpoint externo.
 */
@Module({
  controllers: [ProxyController],
})
export class ProxyModule {}
