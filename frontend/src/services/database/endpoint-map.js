// frontend/src/services/database/endpoint-map.js

/**
 * Mapa de endpoints: nome curto usado pelos importers → rota real do backend
 *
 * Regras:
 *  - Chave  : nome semântico usado em db.save('produtos', data)
 *  - Valor  : segmento da rota POST /api/importacao/<valor>
 */
export const ENDPOINT_MAP = {

    // Produto
    secoes:                            'importar-secoes',
    grupos:                            'importar-grupos',
    subgrupos:                         'importar-subgrupos',
    marcas:                            'importar-marcas',
    familias:                          'importar-familias',
    produtos:                          'importar-produtos',
    produtoAuxiliares:                 'importar-produto-auxiliares',
    produtoFornecedores:               'importar-produto-fornecedores',

    // Financeiro
    categorias:                        'importar-categorias',
    agentes:                           'importar-agentes',
    contasCorrentes:                   'importar-contas-correntes',
    especiesDocumento:                 'importar-especies-documento',
    historicoPadrao:                   'importar-historico-padrao',

    // PDV / Frente de Loja
    formasPagamento:                   'importar-formas-pagamento',
    pagamentosPDV:                     'importar-pagamentos-pdv',
    recebimentosPDV:                   'importar-recebimentos-pdv',
    motivosDesconto:                   'importar-motivos-desconto',
    motivosDevolucao:                  'importar-motivos-devolucao',
    motivosCancelamento:               'importar-motivos-cancelamento',

    // Estoque
    localEstoque:                      'importar-local-estoque',
    tiposAjustes:                      'importar-tipos-ajustes',
    saldoEstoque:                      'importar-saldo-estoque',

    // Fiscal
    regimeTributario:                  'importar-regime-tributario',
    situacoesFiscais:                  'importar-situacoes-fiscais',
    tiposOperacoes:                    'importar-tipos-operacoes',
    impostosFederais:                  'importar-impostos-federais',
    tabelasTributarias:                'importar-tabelas-tributarias',
    cenariosFiscais:                   'importar-cenarios-fiscais',

    // Pessoa 
    lojas:                             'importar-lojas',
    clientes:                          'importar-clientes',
    fornecedores:                      'importar-fornecedores',
};