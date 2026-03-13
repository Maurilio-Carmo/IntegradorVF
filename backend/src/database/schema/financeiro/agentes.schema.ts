// backend/src/database/schema/financeiro/agentes.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const agentes = sqliteTable('agentes', {
  agenteId:          integer('agente_id').primaryKey(),
  nome:              text('nome'),
  fantasia:          text('fantasia'),
  codigoBanco:       text('codigo_banco'),
  tipo:              text('tipo', { enum: ['FISICA','JURIDICA'] }),
  documento:         text('documento'),
  tipoContribuinte:  text('tipo_contribuinte', { enum: ['CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO'] }),
  inscricaoEstadual: text('inscricao_estadual'),
  telefone1:         text('telefone1'),
  holdingId:         text('holding_id'),
  cep:               text('cep'),
  logradouro:        text('logradouro'),
  numero:            text('numero'),
  bairro:            text('bairro'),
  municipio:         text('municipio'),
  ibge:              text('ibge'),
  uf:                text('uf'),
  pais:              text('pais'),
  tipoEndereco:      text('tipo_endereco'),
  status:            text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:           text('retorno'),
  createdAt:         text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:         text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Agente    = typeof agentes.$inferSelect;
export type NovoAgente = typeof agentes.$inferInsert;
