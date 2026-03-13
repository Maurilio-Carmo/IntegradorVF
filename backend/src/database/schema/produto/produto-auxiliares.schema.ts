// backend/src/database/schema/produto/produto-auxiliares.schema.ts

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { produtos } from './produtos.schema';

export const produtoAuxiliares = sqliteTable('produto_auxiliares', {
  codigoId:     text('codigo_id').primaryKey(),
  produtoId:    integer('produto_id').notNull().references(() => produtos.produtoId, { onDelete: 'cascade' }),
  fator:        real('fator').default(1),
  eanTributado: integer('ean_tributado').default(0),
  tipo:         text('tipo', { enum: ['LITERAL','EAN'] }),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type ProdutoAuxiliar    = typeof produtoAuxiliares.$inferSelect;
export type NovoProdutoAuxiliar = typeof produtoAuxiliares.$inferInsert;
