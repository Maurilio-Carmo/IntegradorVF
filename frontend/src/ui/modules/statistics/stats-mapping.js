// frontend/src/ui/modules/statistics/stats-mapping.js

/**
 * Mapeamento estático entre chaves do objeto de stats
 * e os IDs dos elementos `.stat-value` no DOM.
 *
 * Adicionar novas entidades aqui — sem tocar em outros módulos.
 */
export const STATS_MAPPING = {
    // ── Produto ─────────────────────────────────────────────────────────────
    secoes:                       'statSecoes',
    grupos:                       'statGrupos',
    subgrupos:                    'statSubgrupos',
    marcas:                       'statMarcas',
    familias:                     'statFamilias',
    produtos:                     'statProdutos',
    produto_auxiliares:           'statProdutoAuxiliares',
    produto_fornecedores:         'statProdutoFornecedores',

    // ── Pessoa ───────────────────────────────────────────────────────────────
    clientes:                     'statClientes',
    fornecedores:                 'statFornecedores',
    lojas:                        'statLojas',

    // ── Financeiro ───────────────────────────────────────────────────────────
    categorias:                   'statCategorias',
    agentes:                      'statAgentes',
    contas_correntes:             'statContasCorrentes',
    especies_documentos:          'statEspeciesDocumento',
    historico_padrao:             'statHistoricoPadrao',
    limites_credito:              'statLimitesCredito',

    // ── Frente de Loja ───────────────────────────────────────────────────────
    formas_pagamento:             'statFormasPagamento',
    pagamentos_pdv:               'statPagamentosPDV',
    recebimentos_pdv:             'statRecebimentosPDV',
    motivos_desconto:             'statMotivosDesconto',
    motivos_devolucao:            'statMotivosDevolucao',
    motivos_cancelamento:         'statMotivosCancelamento',

    // ── Fiscal ───────────────────────────────────────────────────────────────
    regime_tributario:            'statRegimeTributario',
    situacoes_fiscais:            'statSituacoesFiscais',
    tipos_operacoes:              'statTiposOperacoes',
    impostos_federais:            'statImpostosFederais',
    tabelas_tributarias_entrada:  'statTabelasTributariasEntrada',
    tabelas_tributarias_saida:    'statTabelasTributariasSaida',

    // ── Estoque ──────────────────────────────────────────────────────────────
    tipos_ajustes:                'statTiposAjustes',
    local_estoque:                'statLocalEstoque',
    saldo_estoque:                'statSaldoEstoque'
};