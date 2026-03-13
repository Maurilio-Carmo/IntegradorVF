// backend/src/database/schema/financeiro/contas-correntes.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const contasCorrentes = sqliteTable('contas_correntes', {
  contaId:               integer('conta_id').primaryKey(),
  descricao:             text('descricao'),
  tipo:                  text('tipo'),
  ativa:                 integer('ativa').default(1),
  compoeFluxoCaixa:      integer('compoe_fluxo_caixa').default(0),
  lancamentoConsolidado: integer('lancamento_consolidado').default(0),
  lojaId:                integer('loja_id'),
  nomeLoja:              text('nome_loja'),
  agenteFinanceiroId:    integer('agente_financeiro_id'),
  nomeBanco:             text('nome_banco'),
  codigoBanco:           text('codigo_banco'),
  agencia:               text('agencia'),
  conta:                 text('conta'),
  localPagamento:        text('local_pagamento'),
  identificacaoOfx:      text('identificacao_ofx'),
  status:                text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:               text('retorno'),
  createdAt:             text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:             text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type ContaCorrente    = typeof contasCorrentes.$inferSelect;
export type NovaContaCorrente = typeof contasCorrentes.$inferInsert;
