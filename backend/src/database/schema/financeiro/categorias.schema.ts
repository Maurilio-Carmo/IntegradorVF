// backend/src/database/schema/financeiro/categorias.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const categorias = sqliteTable('categorias', {
  categoriaId:    integer('categoria_id').primaryKey(),
  descricao:      text('descricao'),
  categoriaPaiId: integer('categoria_pai_id'),
  codigoContabil: text('codigo_contabil'),
  inativa:        integer('inativa').default(0),
  posicao:        text('posicao'),
  classificacao:  text('classificacao', { enum: ['RECEITA','DESPESA'] }),
  tipo:           text('tipo', { enum: ['SINTETICA','ANALITICA'] }),
  status:         text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:        text('retorno'),
  createdAt:      text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:      text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Categoria    = typeof categorias.$inferSelect;
export type NovaCategoria = typeof categorias.$inferInsert;
