// frontend/src/ui/tabs/tabs-manager.js

/**
 * Gerenciador de Tabs (Modularizado)
 * Separa navegação, importações e eventos
 */

import Config from '../../services/config.js';
import Importacao from '../../features/import/index.js';
import UI from '../ui.js';

/**
 * Gerenciador de Navegação entre Tabs
 */
export class TabNavigator {
    init() {
        this.setupTabButtons();
    }

    setupTabButtons() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab, tabButtons, tabPanels);
            });
        });
    }

    switchTab(targetTab, tabButtons, tabPanels) {
        // Atualizar botões
        tabButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        if (activeButton) activeButton.classList.add('active');

        // Atualizar painéis
        tabPanels.forEach(panel => panel.classList.remove('active'));
        const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
        if (targetPanel) targetPanel.classList.add('active');
    }
}

/**
 * Gerenciador de Botões de Importação
 */
export class ImportButtonManager {
    constructor() {
        this.actionMap = this.buildActionMap();
    }

    init() {
        this.setupIndividualButtons();
        this.setupBulkButtons();
    }

    buildActionMap() {
        return {
            // PRODUTOS
            'importar-arvore-mercadologica': 'importarArvoreMercadologica',
            'importar-marcas': 'importarMarcas',
            'importar-familias': 'importarFamilias',
            'importar-produtos': 'importarProdutos',
            
            // PESSOA
            'importar-lojas': 'importarLojas',
            'importar-clientes': 'importarClientes',
            'importar-fornecedores': 'importarFornecedores',
            
            // FINANCEIRO
            'importar-categorias': 'importarCategorias',
            'importar-agentes': 'importarAgentes',
            'importar-contas-correntes': 'importarContasCorrentes',
            'importar-especies-documento': 'importarEspeciesDocumento',
            'importar-historico-padrao': 'importarHistoricoPadrao',
            'importar-formas-pagamento': 'importarFormasPagamento',
            
            // PDV / FRENTE DE LOJA
            'importar-caixas': 'importarCaixas',
            'importar-motivos-cancelamento': 'importarMotivosCancelamento',
            'importar-motivos-desconto': 'importarMotivosDesconto',
            'importar-motivos-devolucao': 'importarMotivosDevolucao',
            'importar-pagamentos-pdv': 'importarPagamentosPDV',
            'importar-recebimentos-pdv': 'importarRecebimentosPDV',
            
            // FISCAL
            'importar-impostos-federais': 'importarImpostosFederais',
            'importar-regime-tributario': 'importarRegimeTributario',
            'importar-situacoes-fiscais': 'importarSituacoesFiscais',
            'importar-tabelas-tributarias-entrada': 'importarTabelasTributariasEntrada',
            'importar-tabelas-tributarias-saida': 'importarTabelasTributariasSaida',
            'importar-tipos-operacoes': 'importarTiposOperacoes',
            
            // ESTOQUE
            'importar-local-estoque': 'importarLocalEstoque',
            'importar-tipos-ajustes': 'importarTiposAjustes'
        };
    }

    setupIndividualButtons() {
        Object.entries(this.actionMap).forEach(([action, method]) => {
            const button = document.querySelector(`[data-action="${action}"]`);
            if (button) {
                button.addEventListener('click', async () => {
                    await this.handleIndividualImport(method, button);
                });
            }
        });
    }

    setupBulkButtons() {
        const bulkActions = {
            'btnImportarTudoProduto': [
                'importarSecoes', 'importarGrupos', 'importarSubgrupos',
                'importarMarcas', 'importarFamilias', 'importarProdutos'
            ],
            'btnImportarTudoPessoa': [
                'importarLojas', 'importarClientes', 'importarFornecedores'
            ],
            'btnImportarTudoFinanceiro': [
                'importarCategorias', 'importarAgentes', 'importarContasCorrentes',
                'importarEspeciesDocumento', 'importarHistoricoPadrao'
            ],
            'btnImportarTudoFrenteLoja': [
                'importarCaixas', 'importarMotivosCancelamento', 'importarMotivosDesconto',
                'importarMotivosDevolucao', 'importarPagamentosPDV', 'importarRecebimentosPDV'
            ],
            'btnImportarTudoEstoque': [
                'importarLocalEstoque', 'importarTiposAjustes'
            ],
            'btnImportarTudoFiscal': [
                'importarImpostosFederais', 'importarRegimeTributario', 'importarSituacoesFiscais',
                'importarTabelasTributariasEntrada', 'importarTabelasTributariasSaida', 'importarTiposOperacoes'
            ]
        };

        Object.entries(bulkActions).forEach(([buttonId, methods]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', async () => {
                    await this.handleBulkImport(button, methods);
                });
            }
        });
    }

    async handleIndividualImport(method, button) {
        // Verificar configuração
        if (!Config.estaConfigurado()) {
            UI.alerts.warning('Configure a API antes de importar');
            UI.modals.showConfig();
            return;
        }

        // Encontrar elemento UI
        const item = button.closest('.import-item');
        if (!item) {
            UI.alerts.error('Elemento de importação não encontrado');
            return;
        }

        // Executar importação
        UI.buttons.setLoading(button, true, '⏳ Importando...');

        try {
            if (typeof Importacao[method] === 'function') {
                await Importacao[method](item);
            } else {
                throw new Error(`Método ${method} não encontrado`);
            }
        } catch (error) {
            UI.alerts.error(`Erro: ${error.message}`);
        } finally {
            UI.buttons.setLoading(button, false);
        }
    }

    async handleBulkImport(button, methods) {
        // Verificar configuração
        if (!Config.estaConfigurado()) {
            UI.alerts.warning('Configure a API antes de importar');
            UI.modals.showConfig();
            return;
        }

        // Confirmar ação
        const confirma = UI.modals.confirm(
            `Importar todos os itens deste módulo?\n\n` +
            `Isso importará ${methods.length} tipos de dados.\n\n` +
            `Deseja continuar?`
        );

        if (!confirma) return;

        // Executar importações
        UI.buttons.setLoading(button, true);
        let successCount = 0;
        let errorCount = 0;

        try {
            UI.log('═══════════════════════════════════════', 'info');
            UI.log(`🚀 IMPORTAÇÃO EM MASSA INICIADA`, 'info');
            UI.log(`📋 ${methods.length} itens para importar`, 'info');
            UI.log('═══════════════════════════════════════', 'info');

            for (let i = 0; i < methods.length; i++) {
                const method = methods[i];
                button.textContent = `⏳ ${i + 1}/${methods.length}...`;

                const action = this.methodToAction(method);
                const itemButton = document.querySelector(`[data-action="${action}"]`);
                const item = itemButton?.closest('.import-item');

                if (item && typeof Importacao[method] === 'function') {
                    try {
                        await Importacao[method](item);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                        UI.log(`⚠️ Erro em ${method}: ${error.message}`, 'warning');
                    }
                } else {
                    errorCount++;
                    UI.log(`⚠️ Método ou item não encontrado: ${method}`, 'warning');
                }
            }

            UI.log('═══════════════════════════════════════', 'success');
            UI.log(`✅ Importação em massa finalizada!`, 'success');
            UI.log(`📊 Sucessos: ${successCount} | Erros: ${errorCount}`, 'info');
            UI.log('═══════════════════════════════════════', 'success');

            if (errorCount === 0) {
                UI.alerts.success('Módulo importado com sucesso!');
            } else {
                UI.alerts.warning(
                    `Importação concluída com ${errorCount} erro(s).\n` +
                    `${successCount} item(ns) importado(s) com sucesso.`
                );
            }
        } catch (error) {
            UI.alerts.error(`Erro na importação: ${error.message}`);
        } finally {
            UI.buttons.reset(button);
        }
    }

    methodToAction(method) {
        // Reverter o mapeamento
        for (const [action, methodName] of Object.entries(this.actionMap)) {
            if (methodName === method) return action;
        }
        return method;
    }
}

/**
 * Gerenciador Principal de Tabs
 */
export class TabsManager {
    constructor() {
        this.navigator = new TabNavigator();
        this.importManager = new ImportButtonManager();
    }

    init() {
        console.log('🔧 Inicializando sistema de tabs...');
        this.navigator.init();
        this.importManager.init();
        console.log('✅ Sistema de tabs inicializado');
    }
}

// Criar instância singleton
const Tabs = new TabsManager();

export default Tabs;