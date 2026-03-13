// backend/src/database/schema/controle/sync-logs.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const syncLogs = sqliteTable('sync_logs', {
  id:       integer('id').primaryKey({ autoIncrement: true }),
  level:    text('level', { enum: ['info', 'warn', 'error', 'success'] })
              .notNull()
              .default('info'),
  modulo:   text('modulo'),
  mensagem: text('mensagem').notNull(),
  detalhes: text('detalhes'),
  criadoEm: text('criado_em').default(sql`datetime('now','localtime')`),
});

export type SyncLog    = typeof syncLogs.$inferSelect;
export type NovoSyncLog = typeof syncLogs.$inferInsert;
