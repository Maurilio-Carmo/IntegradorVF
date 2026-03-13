// backend/src/database/schema/controle/sync-control.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const syncControl = sqliteTable('sync_control', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  dominio:      text('dominio').notNull().unique(),
  lastSyncAt:   text('last_sync_at'),
  lastSyncHash: text('last_sync_hash'),   // hash do último payload para detectar mudanças
  totalRecords: integer('total_records').default(0),
  status:       text('status', { enum: ['idle', 'running', 'error'] }).default('idle'),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type SyncControl    = typeof syncControl.$inferSelect;
export type NovoSyncControl = typeof syncControl.$inferInsert;
