// backend/src/database/schema/pessoa/cliente-enderecos.schema.ts

import { sqliteTable, integer, primaryKey, foreignKey, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { clientes } from './clientes.schema';

export const clienteEnderecos = sqliteTable('cliente_enderecos', {
  clienteId:    integer('cliente_id').notNull(),
  tipoEndereco: text('tipo_endereco', { enum: ['PRINCIPAL', 'ENTREGA', 'COBRANCA'] }).notNull(),
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
  pk: primaryKey({ columns: [t.clienteId, t.tipoEndereco] }),

  fkCliente: foreignKey({
    columns:        [t.clienteId],
    foreignColumns: [clientes.clienteId],
  }).onUpdate('cascade').onDelete('cascade'),
}));

export type ClienteEndereco    = typeof clienteEnderecos.$inferSelect;
export type NovoClienteEndereco = typeof clienteEnderecos.$inferInsert;
