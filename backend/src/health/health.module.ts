// backend/src/health/health.module.ts
import { Module }           from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Módulo isolado para o endpoint /health.
 * Não depende de nenhum serviço externo — responde mesmo se DB estiver down.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}