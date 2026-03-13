// backend/src/database/schema/estoque/saldo-estoque.schema.ts

import { sqliteTable, integer, text, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const saldoEstoque = sqliteTable('saldo_estoque', {
  produtoId: integer('produto_id').notNull(),
  localId:   integer('local_id').notNull(),
  lojaId:    integer('loja_id').notNull(),
  saldo:     real('saldo').default(0),
  status:    text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk: primaryKey({ columns: [t.produtoId, t.localId, t.lojaId] }),
}));

export type SaldoEstoque    = typeof saldoEstoque.$inferSelect;
export type NovoSaldoEstoque = typeof saldoEstoque.$inferInsert;
