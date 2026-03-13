// backend/src/database/schema/controle/sync-historico.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const syncHistorico = sqliteTable('sync_historico', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  dominio:     text('dominio').notNull(),
  resultado:   text('resultado'),
  duracaoMs:   integer('duracao_ms'),
  executadoEm: text('executado_em').default(sql`CURRENT_TIMESTAMP`),
});

export type SyncHistorico    = typeof syncHistorico.$inferSelect;
export type NovoSyncHistorico = typeof syncHistorico.$inferInsert;
