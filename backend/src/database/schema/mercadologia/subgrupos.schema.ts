// backend/src/database/schema/produto/subgrupos.schema.ts

import { sqliteTable, integer, text, primaryKey, index, foreignKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { secoes } from './secoes.schema';
import { grupos } from './grupos.schema';

export const subgrupos = sqliteTable('subgrupos', {
  secaoId:      integer('secao_id').notNull(),
  grupoId:      integer('grupo_id').notNull(),
  subgrupoId:   integer('subgrupo_id').notNull(),
  descricaoOld: text('descricao_old'),
  descricaoNew: text('descricao_new'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk: primaryKey({ columns: [t.secaoId, t.grupoId, t.subgrupoId] }),
  idx: index('idx_subgrupos_subgrupo').on(t.secaoId, t.grupoId, t.subgrupoId),

  // FK para secoes (PK simples — ok)
  fkSecao: foreignKey({
    columns:            [t.secaoId],
    foreignColumns:     [secoes.secaoId],
  }).onUpdate('cascade').onDelete('cascade'),

  // FK para grupos referenciando a PK COMPOSTA (secaoId, grupoId)
  fkGrupo: foreignKey({
    columns:            [t.secaoId, t.grupoId],
    foreignColumns:     [grupos.secaoId, grupos.grupoId],
  }).onUpdate('cascade').onDelete('cascade'),
}));

export type Subgrupo     = typeof subgrupos.$inferSelect;
export type NovoSubgrupo = typeof subgrupos.$inferInsert;