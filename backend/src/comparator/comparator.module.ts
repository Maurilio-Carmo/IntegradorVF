// backend/src/comparator/comparator.module.ts
import { Module }            from '@nestjs/common';
import { ComparatorService } from './comparator.service';

/**
 * Módulo de comparação de datasets.
 * Exportado para ser reutilizado pelo FirebirdSyncModule.
 */
@Module({
  providers: [ComparatorService],
  exports:   [ComparatorService],
})
export class ComparatorModule {}
