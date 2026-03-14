// backend/src/database/schema/produto/produto-regimes.schema.ts

import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { produtos } from './produtos.schema';

export const produtoRegimes = sqliteTable('produto_regimes', {
  produtoId:        integer('produto_id').notNull().references(() => produtos.produtoId, { onDelete: 'cascade' }),
  lojaId:           integer('loja_id').notNull(),
  regimeEstadualId: integer('regime_estadual_id'),
  status:           text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  createdAt:        text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:        text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk: primaryKey({ columns: [t.produtoId, t.lojaId] }),
}));

export type ProdutoRegime    = typeof produtoRegimes.$inferSelect;
export type NovoProdutoRegime = typeof produtoRegimes.$inferInsert;
