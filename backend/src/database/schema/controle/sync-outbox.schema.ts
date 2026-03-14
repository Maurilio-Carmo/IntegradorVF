// backend/src/database/schema/controle/sync-outbox.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const syncOutbox = sqliteTable('sync_outbox', {
  id:                 integer('id').primaryKey({ autoIncrement: true }),
  dominio:            text('dominio').notNull(),
  registroId:         integer('registro_id').notNull(),
  operacao:           text('operacao', { enum: ['C', 'U', 'D'] }).notNull(),
  payload:            text('payload'),
  tentativas:         integer('tentativas').default(0),
  maxTentativas:      integer('max_tentativas').default(3),
  status:             text('status', { enum: ['pending', 'processing', 'done', 'error'] })
                        .notNull()
                        .default('pending'),
  erroMsg:            text('erro_msg'),
  syncSource:         text('sync_source', { enum: ['local', 'api'] }).default('local'),
  criadoEm:           text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  processadoEm:       text('processado_em'),
  proximaTentativaEm: text('proxima_tentativa_em'),
});

export type SyncOutbox    = typeof syncOutbox.$inferSelect;
export type NovoSyncOutbox = typeof syncOutbox.$inferInsert;
