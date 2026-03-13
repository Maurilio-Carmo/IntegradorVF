// backend/src/database/schema/financeiro/historico-padrao.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const historicoPadrao = sqliteTable('historico_padrao', {
  historicoId: integer('historico_id').primaryKey(),
  descricao:   text('descricao'),
  status:      text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:     text('retorno'),
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:   text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type HistoricoPadrao    = typeof historicoPadrao.$inferSelect;
export type NovoHistoricoPadrao = typeof historicoPadrao.$inferInsert;
