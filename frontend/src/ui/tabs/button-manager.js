// frontend/src/ui/tabs/import-button-manager.js

/**
 * Gerenciador de Botões de Importação
 * Responsabilidade única: mapear cliques de botão → métodos de importação
 */

import Config     from '../../services/config.js';
import Importacao from '../../features/import/index.js';
import UI         from '../ui.js';

export class ImportButtonManager {

    constructor() {
        this.actionMap = this._buildActionMap();
    }

    /**
     * Inicializar todos os botões
     */
    init() {
        this._setupIndividualButtons();
        this._setupBulkButtons();
        console.log(`✅ ImportButtonManager inicializado (${Object.keys(this.actionMap).length} ações)`);
    }

    // Mapeamento

    _buildActionMap() {
        return {
            // PRODUTO
            'importar-arvore-mercadologica': 'importarArvoreMercadologica',
            'importar-marcas':               'importarMarcas',
            'importar-familias':             'importarFamilias',
            'importar-produtos':             'importarProdutos',

            // PESSOA
            'importar-lojas':                'importarLojas',
            'importar-clientes':             'importarClientes',
            'importar-fornecedores':         'importarFornecedores',

            // FINANCEIRO
            'importar-categorias':           'importarCategorias',
            'importar-agentes':              'importarAgentes',
            'importar-contas-correntes':     'importarContasCorrentes',
            'importar-especies-documento':   'importarEspeciesDocumento',
            'importar-historico-padrao':     'importarHistoricoPadrao',
            'importar-formas-pagamento':     'importarFormasPagamento',

            // PDV / FRENTE DE LOJA
            'importar-caixas':               'importarCaixas',
            'importar-motivos-cancelamento': 'importarMotivosCancelamento',
            'importar-motivos-desconto':     'importarMotivosDesconto',
            'importar-motivos-devolucao':    'importarMotivosDevolucao',
            'importar-pagamentos-pdv':       'importarPagamentosPDV',
            'importar-recebimentos-pdv':     'importarRecebimentosPDV',

            // FISCAL
            'importar-impostos-federais':            'importarImpostosFederais',
            'importar-regime-tributario':            'importarRegimeTributario',
            'importar-situacoes-fiscais':            'importarSituacoesFiscais',
            'importar-tabelas-tributarias-entrada':  'importarTabelasTributariasEntrada',
            'importar-tabelas-tributarias-saida':    'importarTabelasTributariasSaida',
            'importar-tipos-operacoes':              'importarTiposOperacoes',

            // ESTOQUE
            'importar-local-estoque': 'importarLocalEstoque',
            'importar-tipos-ajustes': 'importarTiposAjustes'
        };
    }

    _buildBulkMap() {
        return {
            'btnImportarTudoProduto': [
                'importarArvoreMercadologica',
                'importarMarcas',
                'importarFamilias',
                'importarProdutos'
            ],
            'btnImportarTudoPessoa': [
                'importarLojas',
                'importarClientes',
                'importarFornecedores'
            ],
            'btnImportarTudoFinanceiro': [
                'importarCategorias',
                'importarAgentes',
                'importarContasCorrentes',
                'importarEspeciesDocumento',
                'importarHistoricoPadrao'
            ],
            'btnImportarTudoFrenteLoja': [
                'importarCaixas',
                'importarMotivosCancelamento',
                'importarMotivosDesconto',
                'importarMotivosDevolucao',
                'importarPagamentosPDV',
                'importarRecebimentosPDV'
            ],
            'btnImportarTudoFiscal': [
                'importarImpostosFederais',
                'importarRegimeTributario',
                'importarSituacoesFiscais',
                'importarTabelasTributariasEntrada',
                'importarTabelasTributariasSaida',
                'importarTiposOperacoes'
            ],
            'btnImportarTudoEstoque': [
                'importarLocalEstoque',
                'importarTiposAjustes'
            ]
        };
    }

    // Setup de listeners

    _setupIndividualButtons() {
        Object.entries(this.actionMap).forEach(([action, method]) => {
            const btn = document.querySelector(`[data-action="${action}"]`);
            if (btn) {
                btn.addEventListener('click', () => this._handleIndividual(method, btn));
            }
        });
    }

    _setupBulkButtons() {
        Object.entries(this._buildBulkMap()).forEach(([btnId, methods]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => this._handleBulk(btn, methods));
            }
        });
    }

    // Handlers

    async _handleIndividual(method, button) {
        if (!this._checkConfig()) return;

        const item = button.closest('.import-item');
        if (!item) {
            UI.alerts.error('Elemento de importação não encontrado');
            return;
        }

        UI.buttons.setLoading(button, true, '⏳ Importando...');

        try {
            if (typeof Importacao[method] !== 'function') {
                throw new Error(`Método "${method}" não encontrado`);
            }
            await Importacao[method](item);
        } catch (error) {
            UI.alerts.error(`Erro: ${error.message}`);
        } finally {
            UI.buttons.setLoading(button, false);
        }
    }

    async _handleBulk(button, methods) {
        if (!this._checkConfig()) return;

        UI.buttons.setLoading(button, true, '⏳ Importando tudo...');

        let success = 0;
        let errors  = 0;

        for (const method of methods) {
            // Localizar card correspondente na UI
            const action = this._methodToAction(method);
            const btn    = action ? document.querySelector(`[data-action="${action}"]`) : null;
            const item   = btn?.closest('.import-item') || null;

            try {
                if (typeof Importacao[method] !== 'function') {
                    throw new Error(`Método "${method}" não encontrado`);
                }
                await Importacao[method](item);
                success++;
            } catch (error) {
                console.error(`❌ Bulk import falhou em "${method}":`, error.message);
                errors++;
            }
        }

        UI.buttons.reset(button);

        if (errors === 0) {
            UI.alerts.success(`✅ ${success} importações concluídas com sucesso`);
        } else {
            UI.alerts.warning(`⚠️ ${success} OK — ${errors} com erro`);
        }
    }

    // Helpers

    _checkConfig() {
        if (!Config.estaConfigurado()) {
            UI.alerts.warning('Configure a API antes de importar');
            UI.modals.showConfig();
            return false;
        }
        return true;
    }

    _methodToAction(method) {
        return Object.keys(this.actionMap)
            .find(action => this.actionMap[action] === method) || null;
    }
}

export default ImportButtonManager;