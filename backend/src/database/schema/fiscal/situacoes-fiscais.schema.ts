// backend/src/database/schema/fiscal/situacoes-fiscais.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const situacoesFiscais = sqliteTable('situacoes_fiscais', {
  situacaoId:        integer('situacao_id').primaryKey(),
  descricao:         text('descricao'),
  descricaoCompleta: text('descricao_completa'),
  substituto:        integer('substituto').default(0),
  status:            text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:           text('retorno'),
  createdAt:         text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:         text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type SituacaoFiscal    = typeof situacoesFiscais.$inferSelect;
export type NovaSituacaoFiscal = typeof situacoesFiscais.$inferInsert;
