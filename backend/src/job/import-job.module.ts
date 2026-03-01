// backend/src/import-job/import-job.module.ts
import { Module }              from '@nestjs/common';
import { ImportJobController } from './import-job.controller';
import { ImportJobService }    from './import-job.service';

/**
 * Módulo de Jobs de Importação.
 *
 * Exporta ImportJobService para que os serviços de importação
 * (ProdutoService, FinanceiroService, etc.) possam reportar progresso
 * sem acoplar diretamente ao SSE ou ao SQLite.
 */
@Module({
  controllers: [ImportJobController],
  providers:   [ImportJobService],
  exports:     [ImportJobService],
})
export class ImportJobModule {}