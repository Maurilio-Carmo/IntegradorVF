// backend/src/database/schema/produto/subgrupos.schema.ts

import { sqliteTable, integer, text, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const subgrupos = sqliteTable('subgrupos', {
  secaoId:      integer('secao_id').notNull(),
  grupoId:      integer('grupo_id').notNull(),
  subgrupoId:   integer('subgrupo_id').notNull(),
  descricaoOld: text('descricao_old'),
  descricaoNew: text('descricao_new'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk:  primaryKey({ columns: [t.secaoId, t.grupoId, t.subgrupoId] }),
  idx: index('idx_subgrupos_subgrupo').on(t.secaoId, t.grupoId, t.subgrupoId),
}));

export type Subgrupo    = typeof subgrupos.$inferSelect;
export type NovoSubgrupo = typeof subgrupos.$inferInsert;
