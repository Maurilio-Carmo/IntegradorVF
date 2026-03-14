// backend/src/database/schema/frente-loja/motivos-cancelamento.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const motivosCancelamento = sqliteTable('motivos_cancelamento', {
  motivoId:             integer('motivo_id').primaryKey(),
  descricao:            text('descricao'),
  tipoAplicacao:        text('tipo_aplicacao', { enum: ['ITEM','CUPOM','AMBOS'] }),
  solicitaJustificativa: integer('solicita_justificativa').default(0),
  status:               text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:              text('retorno'),
  createdAt:            text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:            text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type MotivoCancelamento    = typeof motivosCancelamento.$inferSelect;
export type NovoMotivoCancelamento = typeof motivosCancelamento.$inferInsert;
