// backend/src/database/schema/pessoa/fornecedor-enderecos.schema.ts

import { sqliteTable, integer, primaryKey, foreignKey, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { fornecedores } from './fornecedores.schema';

export const fornecedorEnderecos = sqliteTable('fornecedor_enderecos', {
  fornecedorId: integer('fornecedor_id').notNull(),
  tipoEndereco: text('tipo_endereco', { enum: ['PRINCIPAL', 'ENTREGA'] }).notNull(),
  cep:          text('cep'),
  logradouro:   text('logradouro'),
  numero:       text('numero'),
  complemento:  text('complemento'),
  referencia:   text('referencia'),
  bairro:       text('bairro'),
  municipio:    text('municipio'),
  ibge:         text('ibge'),
  uf:           text('uf'),
  pais:         text('pais'),
  status:       text('status', { enum: ['C','U','D','E','S'] }).default('S'),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pk: primaryKey({ columns: [t.fornecedorId, t.tipoEndereco] }),

  fkFornecedor: foreignKey({
    columns:        [t.fornecedorId],
    foreignColumns: [fornecedores.fornecedorId],
  }).onUpdate('cascade').onDelete('cascade'),
}));

export type FornecedorEndereco    = typeof fornecedorEnderecos.$inferSelect;
export type NovoFornecedorEndereco = typeof fornecedorEnderecos.$inferInsert;
