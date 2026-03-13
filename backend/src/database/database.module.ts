// backend/src/database/database.module.ts
// SUBSTITUI versão atual — troca SqliteService por DrizzleService

import { Global, Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
import { FirebirdService } from './firebird.service';

@Global()
@Module({
  providers: [DrizzleService, FirebirdService],
  exports:   [DrizzleService, FirebirdService],
})
export class DatabaseModule {}
