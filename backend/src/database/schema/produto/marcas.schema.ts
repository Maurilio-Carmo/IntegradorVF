// backend/src/database/schema/produto/marcas.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const marcas = sqliteTable('marcas', {
  marcaId:      integer('marca_id').primaryKey(),
  descricaoOld: text('descricao_old'),
  descricaoNew: text('descricao_new'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Marca    = typeof marcas.$inferSelect;
export type NovaMarca = typeof marcas.$inferInsert;
