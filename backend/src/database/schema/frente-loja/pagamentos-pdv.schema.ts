// backend/src/database/schema/frente-loja/pagamentos-pdv.schema.ts

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const pagamentosPdv = sqliteTable('pagamentos_pdv', {
  pagamentoId: integer('pagamento_id').primaryKey(),
  descricao:   text('descricao'),
  categoriaId: integer('categoria_id'),
  lojaId:      integer('loja_id'),
  valorMaximo: real('valor_maximo'),
  status:      text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:     text('retorno'),
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:   text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type PagamentoPdv    = typeof pagamentosPdv.$inferSelect;
export type NovoPagamentoPdv = typeof pagamentosPdv.$inferInsert;
