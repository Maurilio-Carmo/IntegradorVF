// backend/src/database/schema/produto/subgrupos.schema.ts

import { sqliteTable, integer, text, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { secoes } from './secoes.schema';
import { grupos } from './grupos.schema';

export const subgrupos = sqliteTable('subgrupos', {
  secaoId:      integer('secao_id').notNull().references(() => secoes.secaoId, { onUpdate: 'cascade', onDelete: 'cascade' }),
  grupoId:      integer('grupo_id').notNull().references(() => grupos.grupoId, { onUpdate: 'cascade', onDelete: 'cascade' }),
  subgrupoId:   integer('subgrupo_id').notNull(),
  descricaoOld: text('descricao_old'),
  descricaoNew: text('descricao_new'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk:  primaryKey({ columns: [t.secaoId, t.grupoId, t.subgrupoId] }),
  idx: index('idx_subgrupos_subgrupo').on(t.secaoId, t.grupoId, t.subgrupoId),
}));

export type Subgrupo    = typeof subgrupos.$inferSelect;
export type NovoSubgrupo = typeof subgrupos.$inferInsert;
