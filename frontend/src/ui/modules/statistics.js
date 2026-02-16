// frontend/src/ui/modules/statistics.js

/**
 * Gerenciador de Estatísticas
 */

export const Statistics = {
    /**
     * Atualizar estatísticas
     */
    update(stats) {
        const mapping = {
            'secoes': 'statSecoes',
            'grupos': 'statGrupos',
            'subgrupos': 'statSubgrupos',
            'marcas': 'statMarcas',
            'familias': 'statFamilias',
            'produtos': 'statProdutos',
            'clientes': 'statClientes',
            'fornecedores': 'statFornecedores',
            'lojas': 'statLojas',
            'caixas': 'statCaixas',
            'local_estoque': 'statLocalEstoque',
            'agentes': 'statAgentes',
            'categorias': 'statCategorias',
            'contas_correntes': 'statContasCorrentes',
            'especies_documento': 'statEspeciesDocumento',
            'historico_padrao': 'statHistoricoPadrao',
            'motivos_cancelamento': 'statMotivosCancelamento',
            'motivos_desconto': 'statMotivosDesconto',
            'motivos_devolucao': 'statMotivosDevolucao',
            'pagamentos_pdv': 'statPagamentosPDV',
            'recebimentos_pdv': 'statRecebimentosPDV',
            'impostos_federais': 'statImpostosFederais',
            'regime_tributario': 'statRegimeTributario',
            'situacoes_fiscais': 'statSituacoesFiscais',
            'tabelas_tributarias_entrada': 'statTabelasTributariasEntrada',
            'tabelas_tributarias_saida': 'statTabelasTributariasSaida',
            'tipos_operacoes': 'statTiposOperacoes',
            'tipos_ajustes': 'statTiposAjustes'
        };

        for (const [key, elementId] of Object.entries(mapping)) {
            if (stats[key] !== undefined) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.textContent = stats[key];
                }
            }
        }
    },

    /**
     * Animar contador
     */
    animateCounter(elementId, valorFinal, duracao = 1000) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const inicio = parseInt(element.textContent) || 0;
        const incremento = (valorFinal - inicio) / (duracao / 16);
        let valorAtual = inicio;

        const animar = () => {
            valorAtual += incremento;
            
            if ((incremento > 0 && valorAtual >= valorFinal) || 
                (incremento < 0 && valorAtual <= valorFinal)) {
                element.textContent = valorFinal;
            } else {
                element.textContent = Math.floor(valorAtual);
                requestAnimationFrame(animar);
            }
        };

        animar();
    }
};
