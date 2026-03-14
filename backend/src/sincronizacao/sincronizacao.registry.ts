// backend/src/sincronizacao/sincronizacao.registry.ts
//
// Fonte única de verdade para o mapeamento:
//   domínio (string) → tabela Drizzle
//   domínio (string) → coluna PK Drizzle
//
// REGRA: toda entrada em DOMINIO_TABELA deve ter entrada correspondente
// em DOMINIO_PK. Adicionar um novo domínio = atualizar os dois blocos aqui.

import * as schema from '../database/schema';

export const DOMINIO_TABELA: Record<string, any> = {
  // Produto / Mercadológica
  secoes:               schema.secoes,
  grupos:               schema.grupos,
  subgrupos:            schema.subgrupos,
  marcas:               schema.marcas,
  familias:             schema.familias,
  produtos:             schema.produtos,
  produto_auxiliares:   schema.produtoAuxiliares,
  produto_fornecedores: schema.produtoFornecedores,

  // Financeiro
  categorias:           schema.categorias,
  agentes:              schema.agentes,
  contas_correntes:     schema.contasCorrentes,
  especies_documentos:  schema.especiesDocumentos,
  historico_padrao:     schema.historicoPadrao,
  formas_pagamento:     schema.formasPagamento,

  // Frente de Loja / PDV
  pagamentos_pdv:       schema.pagamentosPdv,
  recebimentos_pdv:     schema.recebimentosPdv,
  motivos_desconto:     schema.motivosDesconto,
  motivos_devolucao:    schema.motivosDevolucao,
  motivos_cancelamento: schema.motivosCancelamento,

  // Estoque
  local_estoque:        schema.localEstoque,
  tipos_ajustes:        schema.tiposAjustes,
  saldo_estoque:        schema.saldoEstoque,

  // Fiscal
  regime_tributario:    schema.regimeTributario,
  situacoes_fiscais:    schema.situacoesFiscais,
  tipos_operacoes:      schema.tiposOperacoes,
  impostos_federais:    schema.impostosFederais,
  tabelas_tributarias:  schema.tabelasTributarias,
  cenarios_fiscais:     schema.cenariosFiscais,

  // Pessoa
  lojas:                schema.lojas,
  clientes:             schema.clientes,
  fornecedores:         schema.fornecedores,
};

export const DOMINIO_PK: Record<string, any> = {
  // Produto / Mercadológica
  secoes:               schema.secoes.secaoId,
  grupos:               schema.grupos.grupoId,
  subgrupos:            schema.subgrupos.subgrupoId,
  marcas:               schema.marcas.marcaId,
  familias:             schema.familias.familiaId,
  produtos:             schema.produtos.produtoId,
  produto_auxiliares:   schema.produtoAuxiliares.produtoId,
  produto_fornecedores: schema.produtoFornecedores.produtoId,

  // Financeiro
  categorias:           schema.categorias.categoriaId,
  agentes:              schema.agentes.agenteId,
  contas_correntes:     schema.contasCorrentes.contaId,
  especies_documentos:  schema.especiesDocumentos.especieId,
  historico_padrao:     schema.historicoPadrao.historicoId,
  formas_pagamento:     schema.formasPagamento.formaPagamentoId,

  // Frente de Loja / PDV
  pagamentos_pdv:       schema.pagamentosPdv.pagamentoId,
  recebimentos_pdv:     schema.recebimentosPdv.recebimentoId,
  motivos_desconto:     schema.motivosDesconto.motivoId,
  motivos_devolucao:    schema.motivosDevolucao.motivoId,
  motivos_cancelamento: schema.motivosCancelamento.motivoId,

  // Estoque
  local_estoque:        schema.localEstoque.localId,
  tipos_ajustes:        schema.tiposAjustes.tipoAjusteId,
  saldo_estoque:        schema.saldoEstoque.produtoId,

  // Fiscal
  regime_tributario:    schema.regimeTributario.regimeId,
  situacoes_fiscais:    schema.situacoesFiscais.situacaoId,
  tipos_operacoes:      schema.tiposOperacoes.operacaoId,
  impostos_federais:    schema.impostosFederais.impostoId,
  tabelas_tributarias:  schema.tabelasTributarias.tabelaId,
  cenarios_fiscais:     schema.cenariosFiscais.cenarioId,

  // Pessoa
  lojas:                schema.lojas.lojaId,
  clientes:             schema.clientes.clienteId,
  fornecedores:         schema.fornecedores.fornecedorId,
};
