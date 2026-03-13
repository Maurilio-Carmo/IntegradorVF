// backend/src/database/schema/frente-loja/motivos-desconto.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const motivosDesconto = sqliteTable('motivos_desconto', {
  motivoId:                     integer('motivo_id').primaryKey(),
  descricao:                    text('descricao'),
  tipoAplicacaoDesconto:        text('tipo_aplicacao_desconto', { enum: ['ITEM','SUB_TOTAL','AMBOS'] }),
  tipoCalculoAplicacaoDesconto: text('tipo_calculo_aplicacao_desconto', { enum: ['PERCENTUAL','VALOR','PERCENTUAL_E_VALOR'] }),
  solicitaJustificativa:        integer('solicita_justificativa').default(0),
  descontoFidelidade:           integer('desconto_fidelidade').default(0),
  status:                       text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:                      text('retorno'),
  createdAt:                    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:                    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type MotivoDesconto    = typeof motivosDesconto.$inferSelect;
export type NovoMotivoDesconto = typeof motivosDesconto.$inferInsert;
