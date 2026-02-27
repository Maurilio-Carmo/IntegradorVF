// backend/src/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { SqliteService }   from './sqlite.service';
import { FirebirdService } from './firebird.service';

/**
 * Módulo global de banco de dados.
 * @Global → disponível em todos os módulos sem necessidade de importar explicitamente.
 */
@Global()
@Module({
  providers: [SqliteService, FirebirdService],
  exports:   [SqliteService, FirebirdService],
})
export class DatabaseModule {}
