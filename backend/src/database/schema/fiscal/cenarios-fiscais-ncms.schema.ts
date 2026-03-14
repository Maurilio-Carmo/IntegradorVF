// backend/src/database/schema/fiscal/cenarios-fiscais-ncms.schema.ts

import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { cenariosFiscais } from './cenarios-fiscais.schema';

export const cenariosFiscaisNcms = sqliteTable('cenarios_fiscais_ncms', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  cenarioId:    integer('cenario_id').notNull().references(() => cenariosFiscais.cenarioId, { onDelete: 'cascade' }),
  codigoNcm:    integer('codigo_ncm').notNull(),
  descricaoNcm: text('descricao_ncm'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  uq: uniqueIndex('uq_cf_ncm').on(t.cenarioId, t.codigoNcm),
}));

export type CenarioFiscalNcm    = typeof cenariosFiscaisNcms.$inferSelect;
export type NovoCenarioFiscalNcm = typeof cenariosFiscaisNcms.$inferInsert;
