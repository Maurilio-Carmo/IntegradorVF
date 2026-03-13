// backend/src/database/schema/estoque/local-estoque.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const localEstoque = sqliteTable('local_estoque', {
  localId:       integer('local_id').primaryKey(),
  descricao:     text('descricao'),
  tipoDeEstoque: text('tipo_de_estoque'),
  bloqueio:      integer('bloqueio').default(0),
  avaria:        integer('avaria').default(0),
  status:        text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:       text('retorno'),
  createdAt:     text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:     text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type LocalEstoque    = typeof localEstoque.$inferSelect;
export type NovoLocalEstoque = typeof localEstoque.$inferInsert;
