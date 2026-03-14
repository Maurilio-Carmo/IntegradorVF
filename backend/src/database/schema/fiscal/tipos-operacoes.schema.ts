// backend/src/database/schema/fiscal/tipos-operacoes.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const tiposOperacoes = sqliteTable('tipos_operacoes', {
  operacaoId:              integer('operacao_id').primaryKey(),
  descricao:               text('descricao'),
  tipoDeOperacao:          text('tipo_de_operacao'),
  tipoGeracaoFinanceiro:   text('tipo_geracao_financeiro'),
  modalidade:              text('modalidade'),
  tipoDocumento:           text('tipo_documento'),
  origemDaNota:            text('origem_da_nota'),
  atualizaCustos:          integer('atualiza_custos').default(0),
  atualizaEstoque:         integer('atualiza_estoque').default(0),
  incideImpostosFederais:  integer('incide_impostos_federais').default(0),
  ipiCompoeBasePisCofins:  integer('ipi_compoe_base_pis_cofins').default(0),
  outrasDespBasePisCofins: integer('outras_desp_base_pis_cofins').default(0),
  outrasDespBaseIcms:      integer('outras_desp_base_icms').default(0),
  geraFiscal:              integer('gera_fiscal').default(0),
  destacaIpi:              integer('destaca_ipi').default(0),
  destacaIcms:             integer('destaca_icms').default(0),
  compoeAbc:               integer('compoe_abc').default(0),
  imprimeDescricaoNfe:     integer('imprime_descricao_nfe').default(0),
  enviaObservacaoNfe:      integer('envia_observacao_nfe').default(0),
  utilizaConferencia:      integer('utiliza_conferencia').default(0),
  cfopNoEstado:            text('cfop_no_estado'),
  cfopForaDoEstado:        text('cfop_fora_do_estado'),
  cfopExterior:            text('cfop_exterior'),
  observacao:              text('observacao'),
  codigoCst:               text('codigo_cst'),
  cfopsRelacionados:       text('cfops_relacionados'),
  status:                  text('status', { enum: ['C','U','D','E','S'] }).default('C'),
  retorno:                 text('retorno'),
  createdAt:               text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:               text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type TipoOperacao    = typeof tiposOperacoes.$inferSelect;
export type NovoTipoOperacao = typeof tiposOperacoes.$inferInsert;
