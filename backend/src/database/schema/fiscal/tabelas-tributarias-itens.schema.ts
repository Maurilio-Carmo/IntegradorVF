// backend/src/database/schema/fiscal/tabelas-tributarias-itens.schema.ts
//
// ─── NOVA TABELA ──────────────────────────────────────────────────────────────
//
// Representa os ITENS (destinos por UF) de uma tabela tributária.
// Na API: campo "itens" dentro de GET /v1/fiscal/tabelas-tributarias
//
// Estrutura do JSON da API:
//   {
//     id: 1,
//     tipoDeOperacao: "SAIDA",
//     itens: [
//       {
//         tabelaTributacaoId: 1,
//         uf: "CE",
//         classificacaoDePessoa: "SAIDA_PARA_CONTRIBUINTE",
//         cfopId: 5102,
//         cfopCuponsFiscaisId: 5101,
//         cstId: 10,
//         tributacao: "...",
//         aliquota: 12.0,
//         aliquotaInterna: 17.0,
//         ...
//       }
//     ]
//   }
//
// PK composta: (tabelaId, tipoOperacao, uf, classificacaoDePessoa)
//   → identifica unicamente um item: uma tabela + sentido + estado + tipo de cliente
//
// FK para tabelas_tributarias: (tabelaId, tipoOperacao)
//   → CASCADE para manter integridade quando a tabela pai for deletada/atualizada
//
// ──────────────────────────────────────────────────────────────────────────────

import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tabelasTributarias } from './tabelas-tributarias.schema';

export const tabelasTributariasItens = sqliteTable('tabelas_tributarias_itens', {

  // ── Chave composta ──────────────────────────────────────────────────────────
  tabelaId:              integer('tabela_id').notNull(),
  tipoOperacao:          text('tipo_operacao', {
    enum: ['ENTRADA','SAIDA'],
  }).notNull(),
  uf:                    text('uf').notNull(),
  classificacaoDePessoa: text('classificacao_de_pessoa', {
    enum: [
      'ENTRADA_DE_INDUSTRIA',
      'ENTRADA_DE_DISTRIBUIDOR',
      'ENTRADA_DE_MICROEMPRESA',
      'ENTRADA_DE_VAREJO',
      'ENTRADA_DE_TRANSFERENCIA',
      'SAIDA_PARA_CONTRIBUINTE',
      'SAIDA_PARA_NAO_CONTRIBUINTE',
      'SAIDA_PARA_TRANSFERENCIA',
    ],
  }).notNull(),

  // ── Identificação fiscal ────────────────────────────────────────────────────
  cfopId:              integer('cfop_id'),               // CFOP escrituração
  cfopCuponsFiscaisId: integer('cfop_cupons_fiscais_id'), // CFOP frente de loja
  cstId:               integer('cst_id'),
  tributacao:          text('tributacao'),

  // ── Valores NF ─────────────────────────────────────────────────────────────
  tributadoNF:         real('tributado_nf').default(0),
  isentoNF:            real('isento_nf').default(0),
  outrosNF:            real('outros_nf').default(0),
  tributadoICMS:       real('tributado_icms').default(0),

  // ── ICMS ────────────────────────────────────────────────────────────────────
  aliquota:            real('aliquota').default(0),
  aliquotaInterna:     real('aliquota_interna').default(0),
  agregado:            real('agregado').default(0),
  reducaoOrigem:       real('reducao_origem').default(0),
  icmsOrigem:          real('icms_origem').default(0),
  cargaLiquida:        real('carga_liquida').default(0),

  // ── Flags ICMS ─────────────────────────────────────────────────────────────
  somaIpiNaBase:       integer('soma_ipi_na_base').default(0),        // boolean
  somaIpiNaBaseST:     integer('soma_ipi_na_base_st').default(0),     // boolean
  stDestacado:         integer('st_destacado').default(0),            // boolean
  icmsDesonerado:      integer('icms_desonerado').default(0),         // boolean
  icmsEfetivo:         integer('icms_efetivo').default(0),            // boolean

  // ── Benefício fiscal ────────────────────────────────────────────────────────
  codigoBeneficioFiscal: text('codigo_beneficio_fiscal'),
  motivoDesoneracaoICMS: text('motivo_desoneracao_icms', {
    enum: [
      'TAXI', 'DEFICIENTE_FISICO', 'PRODUTOR_AGROPECUARI', 'FROTISTA_OU_LOCADORA',
      'DIPLOMATICO_CONSULAR', 'UTILITARIOS', 'SUFRAMA', 'VENDA_ORGÃO_PUBLICO',
      'OUTROS', 'DEFICIENTE_CONDUTOR', 'DEFICIENTE_NAO_COND', 'FOMENTO_AGRO_PECU',
    ],
  }),

  // ── Controle ────────────────────────────────────────────────────────────────
  status:    text('status', { enum: ['C','U','D','E','S'] }).default('S'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),

}, (t) => ({

  // PK: tabela + sentido + estado + tipo de pessoa
  pk: primaryKey({
    columns: [t.tabelaId, t.tipoOperacao, t.uf, t.classificacaoDePessoa],
  }),

  // FK → tabelas_tributarias (PK composta do pai)
  fkTabela: foreignKey({
    columns:        [t.tabelaId, t.tipoOperacao],
    foreignColumns: [tabelasTributarias.tabelaId, tabelasTributarias.tipoOperacao],
  }).onUpdate('cascade').onDelete('cascade'),

}));

export type TabelaTributariaItem    = typeof tabelasTributariasItens.$inferSelect;
export type NovoTabelaTributariaItem = typeof tabelasTributariasItens.$inferInsert;
