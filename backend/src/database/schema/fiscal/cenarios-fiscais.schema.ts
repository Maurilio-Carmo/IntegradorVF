// backend/src/database/schema/fiscal/cenarios-fiscais.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const cenariosFiscais = sqliteTable('cenarios_fiscais', {
  cenarioId:  integer('cenario_id').primaryKey(),
  descricao:  text('descricao'),
  cst:        integer('cst'),
  cclasstrib: integer('cclasstrib'),
  status:     text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:    text('retorno'),
  createdAt:  text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:  text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type CenarioFiscal    = typeof cenariosFiscais.$inferSelect;
export type NovoCenarioFiscal = typeof cenariosFiscais.$inferInsert;
