// backend/src/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { SqliteService }   from './sqlite.service';
import { FirebirdService } from './firebird.service';

/**
 * @Global() — SqliteService e FirebirdService ficam disponíveis
 * em TODOS os módulos sem necessidade de reimportar DatabaseModule.
 */
@Global()
@Module({
  providers: [SqliteService, FirebirdService],
  exports:   [SqliteService, FirebirdService],
})
export class DatabaseModule {}