// backend/src/database/schema/produto/produto-min-max.schema.ts

import { sqliteTable, integer, text, real, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { produtos } from './produtos.schema';

export const produtoMinMax = sqliteTable('produto_min_max', {
  produtoId:     integer('produto_id').notNull().references(() => produtos.produtoId, { onDelete: 'cascade' }),
  lojaId:        integer('loja_id').notNull(),
  estoqueMinimo: real('estoque_minimo'),
  estoqueMaximo: real('estoque_maximo'),
  status:        text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  createdAt:     text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:     text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk:  primaryKey({ columns: [t.produtoId, t.lojaId] }),
  idx: index('idx_produto_estoque_loja').on(t.lojaId),
}));

export type ProdutoMinMax    = typeof produtoMinMax.$inferSelect;
export type NovoProdutoMinMax = typeof produtoMinMax.$inferInsert;
