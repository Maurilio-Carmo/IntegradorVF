// backend/src/database/schema/pessoa/clientes.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const clientes = sqliteTable('clientes', {
  clienteId:         integer('cliente_id').primaryKey(),
  tipoDePessoa:      text('tipo_de_pessoa', { enum: ['FISICA','JURIDICA','ESTRANGEIRO'] }),
  documento:         text('documento'),
  nome:              text('nome'),
  fantasia:          text('fantasia'),
  holdingId:         integer('holding_id').default(1),
  tipoContribuinte:  text('tipo_contribuinte', { enum: ['CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO'] }).default('ISENTO'),
  inscricaoEstadual: text('inscricao_estadual').default('ISENTO'),
  telefone1:         text('telefone1'),
  telefone2:         text('telefone2'),
  email:             text('email'),
  dataNascimento:    text('data_nascimento'),
  estadoCivil:       text('estado_civil', { enum: ['SOLTEIRO','CASADO','DIVORCIADO','VIUVO','OUTROS'] }),
  sexo:              text('sexo', { enum: ['MASCULINO','FEMININO'] }),
  orgaoPublico:      integer('orgao_publico').default(0),
  retemIss:          integer('retem_iss').default(0),
  ramo:              integer('ramo').default(0),
  observacao:        text('observacao'),
  tipoPreco:         integer('tipo_preco').default(1),
  tipoBloqueio:      integer('tipo_bloqueio').default(0),
  desconto:          integer('desconto').default(0),
  tabelaPrazo:       text('tabela_prazo', { enum: ['DF','PRZ','DFM','DFD','DFS','DFQ'] }).default('PRZ'),
  prazo:             integer('prazo').default(30),
  corte:             integer('corte'),
  vendedorId:        integer('vendedor_id'),
  cep:               text('cep'),
  logradouro:        text('logradouro'),
  numero:            integer('numero'),
  complemento:       text('complemento'),
  referencia:        text('referencia'),
  bairro:            text('bairro'),
  municipio:         text('municipio'),
  ibge:              integer('ibge'),
  uf:                text('uf'),
  pais:              integer('pais'),
  dataCadastro:      text('data_cadastro'),
  status:            text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:           text('retorno'),
  createdAt:         text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:         text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Cliente    = typeof clientes.$inferSelect;
export type NovoCliente = typeof clientes.$inferInsert;
