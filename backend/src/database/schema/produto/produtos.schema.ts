// backend/src/database/schema/produto/produtos.schema.ts

import { sqliteTable, integer, text, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { secoes } from './secoes.schema';
import { familias } from './familias.schema';
import { marcas } from './marcas.schema';

export const produtos = sqliteTable('produtos', {
  produtoId:            integer('produto_id').primaryKey(),
  descricao:            text('descricao').notNull(),
  descricaoReduzida:    text('descricao_reduzida').notNull(),
  secaoId:              integer('secao_id').references(() => secoes.secaoId, { onDelete: 'set null' }),
  grupoId:              integer('grupo_id'),
  subgrupoId:           integer('subgrupo_id'),
  familiaId:            integer('familia_id').references(() => familias.familiaId, { onDelete: 'set null' }),
  marcaId:              integer('marca_id').references(() => marcas.marcaId, { onDelete: 'set null' }),
  composicao:           text('composicao', { enum: ['NORMAL','COMPOSTO','KIT','RENDIMENTO'] }),
  pesoVariavel:         text('peso_variavel', { enum: ['SIM','PESO','NAO','UNITARIO','PENDENTE'] }),
  unidadeCompra:        text('unidade_compra').notNull(),
  itensEmbalagem:       real('itens_embalagem').default(1),
  unidadeVenda:         text('unidade_venda').notNull(),
  itensEmbalagemVenda:  real('itens_embalagem_venda').default(1),
  unidadeTransf:        text('unidade_transf'),
  itensEmbalagemTransf: real('itens_embalagem_transf').default(1),
  pesoBruto:            real('peso_bruto').default(0),
  pesoLiquido:          real('peso_liquido').default(0),
  rendimentoUnidade:    real('rendimento_unidade').default(0),
  rendimentoCusto:      real('rendimento_custo').default(0),
  tabelaA:              text('tabela_a'),
  genero:               text('genero'),
  ncm:                  text('ncm'),
  cest:                 text('cest'),
  situacaoFiscal:       integer('situacao_fiscal'),
  situacaoFiscalSaida:  integer('situacao_fiscal_saida'),
  naturezaImposto:      integer('natureza_imposto'),
  permiteDesconto:      integer('permite_desconto').default(0),
  descontoMaximo:       real('desconto_maximo').default(0),
  controlaEstoque:      integer('controla_estoque').default(0),
  enviaBalanca:         integer('envia_balanca').default(0),
  descricaoVariavel:    integer('descricao_variavel').default(0),
  precoVariavel:        integer('preco_variavel').default(0),
  ativoEcommerce:       integer('ativo_ecommerce').default(0),
  controlaValidade:     integer('controla_validade').default(0),
  validadeDias:         integer('validade_dias').default(0),
  finalidade:           text('finalidade', { enum: ['COMERCIALIZACAO','CONSUMO','IMOBILIZADO','INDUSTRIALIZADO','MATERIA_PRIMA','OUTROS'] }),
  producao:             text('producao', { enum: ['PROPRIO','TERCEIROS'] }),
  unidadeReferencia:    text('unidade_referencia'),
  medidaReferencial:    real('medida_referencial').default(1),
  indiceAt:             text('indice_at', { enum: ['ARREDONDA','TRUNCA'] }),
  foraLinha:            integer('fora_linha').default(0),
  dataSaida:            text('data_saida'),
  dataInclusao:         text('data_inclusao'),
  dataAlteracao:        text('data_alteracao'),
  status:               text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:              text('retorno'),
  createdAt:            text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:            text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  idxSecao:    index('idx_produtos_secao').on(t.secaoId),
  idxGrupo:    index('idx_produtos_grupo').on(t.grupoId),
  idxSubgrupo: index('idx_produtos_subgrupo').on(t.subgrupoId),
  idxFamilia:  index('idx_produtos_familia').on(t.familiaId),
  idxMarca:    index('idx_produtos_marca').on(t.marcaId),
}));

export type Produto    = typeof produtos.$inferSelect;
export type NovoProduto = typeof produtos.$inferInsert;
