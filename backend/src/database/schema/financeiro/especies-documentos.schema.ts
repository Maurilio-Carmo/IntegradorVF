// backend/src/database/schema/financeiro/especies-documentos.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const especiesDocumentos = sqliteTable('especies_documentos', {
  especieId:   integer('especie_id').primaryKey(),
  descricao:   text('descricao'),
  codigoBacen: text('codigo_bacen'),
  status:      text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:     text('retorno'),
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:   text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type EspecieDocumento    = typeof especiesDocumentos.$inferSelect;
export type NovaEspecieDocumento = typeof especiesDocumentos.$inferInsert;
