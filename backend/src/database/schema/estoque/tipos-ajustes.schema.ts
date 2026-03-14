// backend/src/database/schema/estoque/tipos-ajustes.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tiposAjustes = sqliteTable('tipos_ajustes', {
  ajusteId:       integer('ajuste_id').primaryKey(),
  descricao:      text('descricao'),
  tipo:           text('tipo'),
  tipoDeOperacao: text('tipo_de_operacao'),
  tipoReservado:  integer('tipo_reservado').default(0),
  status:         text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:        text('retorno'),
  createdAt:      text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:      text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type TipoAjuste    = typeof tiposAjustes.$inferSelect;
export type NovoTipoAjuste = typeof tiposAjustes.$inferInsert;
