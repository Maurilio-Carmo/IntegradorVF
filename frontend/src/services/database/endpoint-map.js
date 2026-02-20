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
    mercadologia:                      'importar-mercadologia',
    secoes:                            'importar-mercadologia',
    grupos:                            'importar-mercadologia',
    subgrupos:                         'importar-mercadologia',
    marcas:                            'importar-marcas',
    familias:                          'importar-familias',
    produtos:                          'importar-produtos',

    // Financeiro
    categorias:                        'importar-categorias',
    agentes:                           'importar-agentes',
    contasCorrentes:                   'importar-contas-correntes',
    especiesDocumento:                 'importar-especies-documento',
    historicoPadrao:                   'importar-historico-padrao',

    // PDV / Frente de Loja
    pagamentosPdv:                     'importar-pagamentos-pdv',
    recebimentosPdv:                   'importar-recebimentos-pdv',
    motivosDesconto:                   'importar-motivos-desconto',
    motivosDevolucao:                  'importar-motivos-devolucao',
    motivosCancelamento:               'importar-motivos-cancelamento',

    // Estoque
    localEstoque:                      'importar-local-estoque',
    tiposAjustes:                      'importar-tipos-ajustes',

    // Fiscal
    regimeTributario:                  'importar-regime-tributario',
    situacoesFiscais:                  'importar-situacoes-fiscais',
    tiposOperacoes:                    'importar-tipos-operacoes',
    impostosFederais:                  'importar-impostos-federais',
    tabelasTributariasEntrada:         'importar-tabelas-tributarias-entrada',
    tabelasTributariasSaida:           'importar-tabelas-tributarias-saida',

    // Pessoa 
    lojas:                             'importar-lojas',
    clientes:                          'importar-clientes',
    fornecedores:                      'importar-fornecedores',
};