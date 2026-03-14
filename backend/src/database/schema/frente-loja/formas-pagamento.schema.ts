// backend/src/database/schema/frente-loja/formas-pagamento.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const formasPagamento = sqliteTable('formas_pagamento', {
  formaPagamentoId:      integer('forma_pagamento_id').primaryKey(),
  descricao:             text('descricao'),
  especieDeDocumentoId:  integer('especie_de_documento_id'),
  categoriaFinanceiraId: integer('categoria_financeira_id'),
  agenteFinanceiroId:    integer('agente_financeiro_id'),
  controleDeCartao:      integer('controle_de_cartao').default(0),
  movimentaContaCorrente: integer('movimenta_conta_corrente').default(0),
  ativa:                 integer('ativa').default(1),
  contaCorrenteId:       integer('conta_corrente_id'),
  status:                text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:               text('retorno'),
  createdAt:             text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:             text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type FormaPagamento    = typeof formasPagamento.$inferSelect;
export type NovaFormaPagamento = typeof formasPagamento.$inferInsert;
