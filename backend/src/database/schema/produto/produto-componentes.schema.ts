// backend/src/database/schema/produto/produto-componentes.schema.ts

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { produtos } from './produtos.schema';

export const produtoComponentes = sqliteTable('produto_componentes', {
  id:                  integer('id').primaryKey(),
  produtoId:           integer('produto_id').notNull().references(() => produtos.produtoId, { onDelete: 'cascade' }),
  componenteProdutoId: integer('componente_produto_id').notNull(),
  quantidade:          real('quantidade').default(1),
  preco1:              real('preco1').default(0),
  preco2:              real('preco2').default(0),
  preco3:              real('preco3').default(0),
  status:              text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  createdAt:           text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:           text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type ProdutoComponente    = typeof produtoComponentes.$inferSelect;
export type NovoProdutoComponente = typeof produtoComponentes.$inferInsert;
