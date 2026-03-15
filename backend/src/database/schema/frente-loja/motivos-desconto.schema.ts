// backend/src/database/schema/frente-loja/motivos-desconto.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const motivosDesconto = sqliteTable('motivos_desconto', {
  motivoId:          integer('motivo_id').primaryKey(),
  descricao:         text('descricao'),
  tipoDesconto:      text('tipo_desconto', { enum: ['ITEM','SUB_TOTAL','AMBOS'] }),
  tipoCalculo:       text('tipo_aplicacao', { enum: ['PERCENTUAL','VALOR','PERCENTUAL_E_VALOR'] }),
  justificativa:     integer('solicita_justificativa').default(0),
  fidelidade:        integer('desconto_fidelidade').default(0),
  status:            text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:           text('retorno'),
  createdAt:         text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:         text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type MotivoDesconto    = typeof motivosDesconto.$inferSelect;
export type NovoMotivoDesconto = typeof motivosDesconto.$inferInsert;
