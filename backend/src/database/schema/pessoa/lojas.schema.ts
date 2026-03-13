// backend/src/database/schema/pessoa/lojas.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const lojas = sqliteTable('lojas', {
  lojaId:             integer('loja_id').primaryKey(),
  nome:               text('nome'),
  fantasia:           text('fantasia'),
  perfilFiscal:       text('perfil_fiscal'),
  atividadeEconomica: text('atividade_economica'),
  ramoAtuacaoId:      text('ramo_atuacao_id'),
  agenteValidacao:    text('agente_validacao'),
  crt:                text('crt'),
  matriz:             integer('matriz').default(0),
  sigla:              text('sigla'),
  mail:               text('mail'),
  telefone:           text('telefone'),
  cep:                text('cep'),
  uf:                 text('uf'),
  cidade:             text('cidade'),
  logradouro:         text('logradouro'),
  numero:             integer('numero'),
  bairro:             text('bairro'),
  tipo:               text('tipo'),
  tipoContribuinte:   text('tipo_contribuinte'),
  ativo:              integer('ativo').default(1),
  ecommerce:          integer('ecommerce').default(0),
  locaisDaLojaIds:    text('locais_da_loja_ids'),
  status:             text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:            text('retorno'),
  createdAt:          text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:          text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Loja    = typeof lojas.$inferSelect;
export type NovaLoja = typeof lojas.$inferInsert;
