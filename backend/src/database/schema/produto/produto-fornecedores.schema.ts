// backend/src/database/schema/produto/produto-fornecedores.schema.ts

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const produtoFornecedores = sqliteTable('produto_fornecedores', {
  id:           integer('id').primaryKey(),
  produtoId:    integer('produto_id').notNull(),
  fornecedorId: integer('fornecedor_id').notNull(),
  referencia:   text('referencia').notNull(),
  unidade:      text('unidade').notNull(),
  fator:        real('fator').notNull().default(1),
  nivel:        text('nivel', { enum: ['PRINCIPAL','SECUNDARIO'] }),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type ProdutoFornecedor    = typeof produtoFornecedores.$inferSelect;
export type NovoProdutoFornecedor = typeof produtoFornecedores.$inferInsert;
