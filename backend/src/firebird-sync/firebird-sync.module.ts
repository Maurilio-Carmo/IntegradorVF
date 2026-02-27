// backend/src/firebird-sync/firebird-sync.module.ts
import { Module }               from '@nestjs/common';
import { ComparatorModule }     from '../comparator/comparator.module';
import { FirebirdSyncController } from './firebird-sync.controller';
import { FirebirdSyncService }    from './firebird-sync.service';

/**
 * Módulo de sincronização SQLite ↔ Firebird 2.5.
 * Importa ComparatorModule para reutilizar o engine de diff.
 * Expõe endpoints para comparar, migrar e atualizar dados entre os bancos.
 */
@Module({
  imports:     [ComparatorModule],
  controllers: [FirebirdSyncController],
  providers:   [FirebirdSyncService],
})
export class FirebirdSyncModule {}
