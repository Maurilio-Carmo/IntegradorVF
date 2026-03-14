// backend/src/database/schema/produto/familias.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const familias = sqliteTable('familias', {
  familiaId:    integer('familia_id').primaryKey(),
  descricaoOld: text('descricao_old'),
  descricaoNew: text('descricao_new'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Familia    = typeof familias.$inferSelect;
export type NovaFamilia = typeof familias.$inferInsert;
