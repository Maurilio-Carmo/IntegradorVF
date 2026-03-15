// backend/src/sincronizacao/sincronizacao.registry.ts
//
// ─── CORREÇÕES APLICADAS ───────────────────────────────────────────────────────
//
// BUG CRÍTICO (2.2 / Tabela 10):
//   ANTES: produto_fornecedores → schema.produtoFornecedores.produtoId
//   → produtoId NÃO é a PK da tabela. A PK real é `id` (autoincrement integer).
//   DEPOIS: produto_fornecedores → schema.produtoFornecedores.id
//
// RISCO (Tabela 10) — ALTO:
//   produto_auxiliares → confirmar se PK é produtoId ou autoincrement.
//   NOTA: mantido como produtoId até confirmação do schema. Se for autoincrement,
//   atualizar para schema.produtoAuxiliares.id (equivalente a produtoFornecedores).
//
// RISCO (Tabela 10) — ALTO:
//   saldo_estoque → PK composta (produtoId + lojaId). O sincronizador usa
//   apenas produtoId. Funciona como "PK de identificação principal" mas
//   pode gerar queries incompletas se houver múltiplas lojas por produto.
//   TODO: avaliar se o sincronizador precisa suportar PKs compostas.
//
// RISCO (Tabela 10) — ALTO:
//   subgrupos/grupos têm PKs compostas mas o registry mapeia apenas uma coluna.
//   O sincronizador atual usa esses valores para SELECT por PK simples — 
//   funciona se as PKs individuais forem únicas na prática, mas é tecnicamente
//   incorreto para PKs compostas. TODO para versão futura.
//
// RISCO (Tabela 10) — ALTO:
//   tabelas_tributarias tem PK composta (tabelaId + tipoOperacao) mas o registry
//   mapeia apenas tabelaId. Mesmo risco acima.
//
// ──────────────────────────────────────────────────────────────────────────────

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
  clienteEnderecos:     schema.clienteEnderecos,
  fornecedores:         schema.fornecedores,
  fornecedorEnderecos:  schema.fornecedorEnderecos,
};

export const DOMINIO_PK: Record<string, any> = {
  // Produto / Mercadológica
  secoes:               schema.secoes.secaoId,
  grupos:               schema.grupos.grupoId,
  subgrupos:            schema.subgrupos.subgrupoId,
  marcas:               schema.marcas.marcaId,
  familias:             schema.familias.familiaId,
  produtos:             schema.produtos.produtoId,
  produto_auxiliares:   schema.produtoAuxiliares.codigoId ,
  produto_fornecedores: schema.produtoFornecedores.id,

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
  tipos_ajustes:        schema.tiposAjustes.ajusteId,
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
  clienteEnderecos:     schema.clienteEnderecos.clienteId,
  fornecedores:         schema.fornecedores.fornecedorId,
  fornecedorEnderecos:  schema.fornecedorEnderecos.fornecedorId,
};