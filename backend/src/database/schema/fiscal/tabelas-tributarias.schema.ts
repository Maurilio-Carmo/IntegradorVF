// backend/src/database/schema/fiscal/tabelas-tributarias.schema.ts

import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tabelasTributarias = sqliteTable('tabelas_tributarias', {
  tabelaId:         integer('tabela_id').notNull(),
  tipoOperacao:     text('tipo_operacao', { enum: ['ENTRADA','SAIDA'] }).notNull(),
  regimeEstadualId: integer('regime_estadual_id'),
  situacaoFiscalId: integer('situacao_fiscal_id'),
  figuraFiscalId:   integer('figura_fiscal_id'),
  ufOrigem:         text('uf_origem'),
  decreto:          text('decreto'),
  status:           text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:          text('retorno'),
  createdAt:        text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:        text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk: primaryKey({ columns: [t.tabelaId, t.tipoOperacao] }),
}));

export type TabelaTributaria    = typeof tabelasTributarias.$inferSelect;
export type NovaTabelaTributaria = typeof tabelasTributarias.$inferInsert;
