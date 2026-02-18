// frontend/src/ui/modules/statistics.js

/**
 * Gerenciador de Estatísticas
 * 
 * Responsabilidades:
 *  - Atualizar valores dos stat-cards no DOM
 *  - Mostrar apenas a seção correspondente à aba ativa
 *  - Reagir ao evento 'tabChanged' emitido pelo TabNavigator
 */

export const Statistics = {

    // Mapeamento: chave do stats-object → id do elemento
    _mapping: {
        // Produto
        'secoes':                       'statSecoes',
        'grupos':                       'statGrupos',
        'subgrupos':                    'statSubgrupos',
        'marcas':                       'statMarcas',
        'familias':                     'statFamilias',
        'produtos':                     'statProdutos',
        // Pessoa
        'clientes':                     'statClientes',
        'fornecedores':                 'statFornecedores',
        'lojas':                        'statLojas',
        // Financeiro
        'categorias':                   'statCategorias',
        'agentes':                      'statAgentes',
        'contas_correntes':             'statContasCorrentes',
        'especies_documentos':          'statEspeciesDocumento',
        'historico_padrao':             'statHistoricoPadrao',
        'limites_credito':              'statLimitesCredito',
        // Frente de Loja
        'caixas':                       'statCaixas',
        'formas_pagamento':             'statFormasPagamento',
        'motivos_cancelamento':         'statMotivosCancelamento',
        'motivos_desconto':             'statMotivosDesconto',
        'motivos_devolucao':            'statMotivosDevolucao',
        'pagamentos_pdv':               'statPagamentosPDV',
        'recebimentos_pdv':             'statRecebimentosPDV',
        // Fiscal
        'impostos_federais':            'statImpostosFederais',
        'regime_tributario':            'statRegimeTributario',
        'situacoes_fiscais':            'statSituacoesFiscais',
        'tabelas_tributarias_entrada':  'statTabelasTributariasEntrada',
        'tabelas_tributarias_saida':    'statTabelasTributariasSaida',
        'tipos_operacoes':              'statTiposOperacoes',
        // Estoque
        'tipos_ajustes':                'statTiposAjustes',
        'local_estoque':                'statLocalEstoque'
    },

    // Inicialização — chamar uma vez após componentsLoaded

    /**
     * Registra o listener de mudança de aba e mostra a seção inicial.
     * @param {string} initialTab - Aba ativa ao carregar (default: 'produto')
     */
    init(initialTab = 'produto') {
        // Ouvir o evento emitido pelo TabNavigator
        document.addEventListener('tabChanged', (e) => {
            this.showForTab(e.detail?.tab);
        });

        // Exibir seção da aba inicial
        this.showForTab(initialTab);
    },

    // Visibilidade por aba

    /**
     * Mostra apenas a .stats-section cujo [data-tab] corresponde à aba ativa.
     * @param {string} tabName - Valor de data-tab da aba selecionada
     */
    showForTab(tabName) {
        if (!tabName) return;

        const sections = document.querySelectorAll('.stats-section[data-tab]');

        sections.forEach(section => {
            const isActive = section.dataset.tab === tabName;
            // Usando classe em vez de display inline — permite transição CSS
            section.classList.toggle('stats-section--hidden', !isActive);
            section.classList.toggle('stats-section--active', isActive);
        });
    },

    // Atualização de valores

    /**
     * Atualiza todos os stat-values a partir do objeto de estatísticas.
     * @param {Object} stats - { secoes: 10, grupos: 50, ... }
     */
    update(stats) {
        for (const [key, elementId] of Object.entries(this._mapping)) {
            if (stats[key] !== undefined) {
                const el = document.getElementById(elementId);
                if (el) el.textContent = stats[key];
            }
        }
    },

    // Animação de contador

    /**
     * Anima o contador de um elemento de stat-value.
     * @param {string} elementId - ID do elemento
     * @param {number} valorFinal - Valor alvo
     * @param {number} duracao    - Duração em ms (default: 1000)
     */
    animateCounter(elementId, valorFinal, duracao = 1000) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const inicio      = parseInt(el.textContent) || 0;
        const incremento  = (valorFinal - inicio) / (duracao / 16);
        let   valorAtual  = inicio;

        const animar = () => {
            valorAtual += incremento;
            const chegou = incremento >= 0
                ? valorAtual >= valorFinal
                : valorAtual <= valorFinal;

            if (chegou) {
                el.textContent = valorFinal;
            } else {
                el.textContent = Math.floor(valorAtual);
                requestAnimationFrame(animar);
            }
        };

        animar();
    }
};