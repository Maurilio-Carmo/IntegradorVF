// backend/src/database/schema/fiscal/regime-tributario.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const regimeTributario = sqliteTable('regime_tributario', {
  regimeId:      integer('regime_id').primaryKey(),
  descricao:     text('descricao'),
  classificacao: text('classificacao'),
  loja:          integer('loja').default(0),
  fornecedor:    integer('fornecedor').default(0),
  status:        text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:       text('retorno'),
  createdAt:     text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:     text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type RegimeTributario    = typeof regimeTributario.$inferSelect;
export type NovoRegimeTributario = typeof regimeTributario.$inferInsert;
