// backend/src/database-control/database-control.module.ts
import { Module }                    from '@nestjs/common';
import { DatabaseControlController } from './database-control.controller';
import { DatabaseControlService }    from './database-control.service';

/**
 * Módulo de controle do banco SQLite.
 * Expõe endpoints para criar, limpar, resetar e inspecionar o banco.
 * Funcionalidade nova — não existia no Express legado.
 */
@Module({
  controllers: [DatabaseControlController],
  providers:   [DatabaseControlService],
})
export class DatabaseControlModule {}
