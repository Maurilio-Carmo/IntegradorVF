// backend/src/database/schema/produto/grupos.schema.ts

import { sqliteTable, integer, text, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { secoes } from './secoes.schema';

export const grupos = sqliteTable('grupos', {
  secaoId:      integer('secao_id').notNull().references(() => secoes.secaoId, { onUpdate: 'cascade', onDelete: 'cascade' }),
  grupoId:      integer('grupo_id').notNull(),
  descricaoOld: text('descricao_old'),
  descricaoNew: text('descricao_new'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:      text('retorno'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk:  primaryKey({ columns: [t.secaoId, t.grupoId] }),
  idx: index('idx_grupos_grupo').on(t.secaoId, t.grupoId),
}));

export type Grupo    = typeof grupos.$inferSelect;
export type NovoGrupo = typeof grupos.$inferInsert;
