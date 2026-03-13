// backend/src/database/schema/produto/secoes.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const secoes = sqliteTable('secoes', {
  secaoId:      integer('secao_id').primaryKey(),
  descricaoOld: text('descricao_old'),
  descricaoNew: text('descricao_new'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Secao    = typeof secoes.$inferSelect;
export type NovaSecao = typeof secoes.$inferInsert;
