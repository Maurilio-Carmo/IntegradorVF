// backend/src/database/schema/fiscal/impostos-federais.schema.ts

import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const impostosFederais = sqliteTable('impostos_federais', {
  impostoId:                text('imposto_id').primaryKey(),
  descricao:                text('descricao'),
  tipo:                     text('tipo', { enum: ['IRPJ','CSLL','OUTROS'] }),
  cstEntradaReal:           text('cst_entrada_real'),
  cstSaidaReal:             text('cst_saida_real'),
  aliquotaEntradaReal:      real('aliquota_entrada_real').default(0),
  aliquotaSaidaReal:        real('aliquota_saida_real').default(0),
  cstEntradaPresumido:      text('cst_entrada_presumido'),
  cstSaidaPresumido:        text('cst_saida_presumido'),
  aliquotaEntradaPresumido: real('aliquota_entrada_presumido').default(0),
  aliquotaSaidaPresumido:   real('aliquota_saida_presumido').default(0),
  cstEntradaSimples:        text('cst_entrada_simples'),
  cstSaidaSimples:          text('cst_saida_simples'),
  status:                   text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:                  text('retorno'),
  createdAt:                text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:                text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type ImpostoFederal    = typeof impostosFederais.$inferSelect;
export type NovoImpostoFederal = typeof impostosFederais.$inferInsert;
