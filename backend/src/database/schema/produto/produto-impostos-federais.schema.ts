// backend/src/database/schema/produto/produto-impostos-federais.schema.ts

import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { produtos } from './produtos.schema';

export const produtoImpostosFederais = sqliteTable('produto_impostos_federais', {
  produtoId: integer('produto_id').notNull().references(() => produtos.produtoId, { onDelete: 'cascade' }),
  impostoId: text('imposto_id').notNull(),
  status:    text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk: primaryKey({ columns: [t.produtoId, t.impostoId] }),
}));

export type ProdutoImpostoFederal    = typeof produtoImpostosFederais.$inferSelect;
export type NovoProdutoImpostoFederal = typeof produtoImpostosFederais.$inferInsert;
