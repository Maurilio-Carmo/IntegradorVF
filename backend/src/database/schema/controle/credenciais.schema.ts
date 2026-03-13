// backend/src/database/schema/controle/credenciais.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const credenciais = sqliteTable('credenciais', {
  id:        integer('id').primaryKey().default(1),
  lojaId:    integer('loja_id').notNull(),
  urlApi:    text('url_api').notNull(),
  tokenApi:  text('token_api').notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Credencial    = typeof credenciais.$inferSelect;
export type NovaCredencial = typeof credenciais.$inferInsert;
