// backend/src/database/schema/pessoa/fornecedores.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const fornecedores = sqliteTable('fornecedores', {
  fornecedorId:         integer('fornecedor_id').primaryKey(),
  tipoPessoa:           text('tipo_pessoa', { enum: ['FISICA','JURIDICA','ESTRANGEIRO'] }),
  documento:            text('documento'),
  nome:                 text('nome'),
  fantasia:             text('fantasia'),
  holdingId:            integer('holding_id'),
  tipoContribuinte:     text('tipo_contribuinte', { enum: ['CONTRIBUINTE','NAO_CONTRIBUINTE','ISENTO'] }),
  inscricaoEstadual:    text('inscricao_estadual'),
  telefone1:            text('telefone1'),
  telefone2:            text('telefone2'),
  email:                text('email'),
  tipoFornecedor:       text('tipo_fornecedor'),
  servico:              integer('servico').default(0),
  transportadora:       integer('transportadora').default(0),
  produtorRural:        integer('produtor_rural').default(0),
  inscricaoMunicipal:   text('inscricao_municipal'),
  tabelaPrazo:          text('tabela_prazo'),
  prazo:                integer('prazo'),
  prazoEntrega:         integer('prazo_entrega'),
  tipoFrete:            text('tipo_frete'),
  observacao:           text('observacao'),
  desativaPedido:       integer('desativa_pedido').default(0),
  tipoPedido:           text('tipo_pedido'),
  regimeEstadual:       text('regime_estadual'),
  destacaSubstituicao:  integer('destaca_substituicao').default(0),
  consideraDesoneracao: integer('considera_desoneracao').default(0),
  cep:                  text('cep'),
  logradouro:           text('logradouro'),
  numero:               text('numero'),
  complemento:          text('complemento'),
  referencia:           text('referencia'),
  bairro:               text('bairro'),
  municipio:            text('municipio'),
  ibge:                 text('ibge'),
  uf:                   text('uf'),
  pais:                 text('pais'),
  criadoEm:             text('criado_em'),
  atualizadoEm:         text('atualizado_em'),
  status:               text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:              text('retorno'),
  createdAt:            text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:            text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Fornecedor    = typeof fornecedores.$inferSelect;
export type NovoFornecedor = typeof fornecedores.$inferInsert;
