// backend/src/database/schema/frente-loja/motivos-devolucao.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const motivosDevolucao = sqliteTable('motivos_devolucao', {
  motivoId:  integer('motivo_id').primaryKey(),
  descricao: text('descricao'),
  status:    text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:   text('retorno'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type MotivoDevolucao    = typeof motivosDevolucao.$inferSelect;
export type NovoMotivoDevolucao = typeof motivosDevolucao.$inferInsert;
