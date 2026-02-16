// frontend/src/ui/tabs.js

/**
 * Módulo de Gerenciamento de Tabs
 * Controla navegação entre abas e importações
 */

import Config from '../services/config.js';
import Importacao from '../features/importacao.js';
import UI from './ui.js';

const Tabs = {
    /**
     * Inicializar sistema de tabs
     */
    init() {
        console.log('🔧 Inicializando sistema de tabs...');
        this.setupTabNavigation();
        this.setupImportButtons();
        this.setupBulkImportButtons();
        console.log('✅ Sistema de tabs inicializado');
    },

    /**
     * Configurar navegação entre tabs
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Atualizar botões ativos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Atualizar painéis ativos
                tabPanels.forEach(panel => panel.classList.remove('active'));
                const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    },

    /**
     * Configurar botões individuais de importação
     */
    setupImportButtons() {
        const buttonActions = {
            // PRODUTOS
            'importar-secao': 'importarSecoes',
            'importar-grupos': 'importarGrupos',
            'importar-subgrupos': 'importarSubgrupos',
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
            
            // FRENTE DE LOJA
            'importar-caixas': 'importarCaixas',
            'importar-motivos-cancelamento': 'importarMotivosCancelamento',
            'importar-motivos-desconto': 'importarMotivosDesconto',
            'importar-motivos-devolucao': 'importarMotivosDevolucao',
            'importar-formas-pagamento': 'importarPagamentosPDV',
            'importar-formas-recebimento': 'importarRecebimentosPDV',
            
            // ESTOQUE
            'importar-locais-estoque': 'importarLocalEstoque',
            'importar-tipos-ajustes': 'importarTiposAjustes',
            
            // FISCAL
            'importar-impostos-federais': 'importarImpostosFederais',
            'importar-regime-tributario': 'importarRegimeTributario',
            'importar-situacoes-fiscais': 'importarSituacoesFiscais',
            'importar-tabelas-entrada': 'importarTabelasTributariasEntrada',
            'importar-tabelas-saida': 'importarTabelasTributariasSaida',
            'importar-tipos-operacoes': 'importarTiposOperacoes'
        };

        Object.entries(buttonActions).forEach(([action, method]) => {
            const button = document.querySelector(`[data-action="${action}"]`);
            if (button) {
                button.addEventListener('click', async () => {
                    await this.handleImportClick(method, button);
                });
            }
        });
    },

    /**
     * Configurar botões de importação em massa (Importar Tudo)
     */
    setupBulkImportButtons() {
        const bulkActions = {
            'btnImportarTudoProduto': [
                'importarSecoes',
                'importarGrupos',
                'importarSubgrupos',
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
            'btnImportarTudoEstoque': [
                'importarLocalEstoque',
                'importarTiposAjustes'
            ],
            'btnImportarTudoFiscal': [
                'importarImpostosFederais',
                'importarRegimeTributario',
                'importarSituacoesFiscais',
                'importarTabelasTributariasEntrada',
                'importarTabelasTributariasSaida',
                'importarTiposOperacoes'
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
    },

    /**
     * Manipular clique em botão de importação individual
     */
    async handleImportClick(method, button) {
        // Verificar se está configurado
        if (!Config.estaConfigurado()) {
            UI.mostrarAlerta('⚙️ Configure a API antes de importar', 'warning');
            UI.mostrarConfig();
            return;
        }

        // Encontrar o card/item pai
        const item = button.closest('.import-item');
        if (!item) {
            UI.mostrarAlerta('❌ Erro: elemento de importação não encontrado', 'error');
            return;
        }

        // Desabilitar botão durante importação
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = '⏳ Importando...';

        try {
            // Executar método de importação
            if (typeof Importacao[method] === 'function') {
                await Importacao[method](item);
            } else {
                throw new Error(`Método ${method} não encontrado`);
            }
        } catch (error) {
            UI.mostrarAlerta(`❌ Erro: ${error.message}`, 'error');
        } finally {
            // Restaurar botão
            button.disabled = false;
            button.textContent = originalText;
        }
    },

    /**
     * Manipular importação em massa
     */
    async handleBulkImport(button, methods) {
        // Verificar se está configurado
        if (!Config.estaConfigurado()) {
            UI.mostrarAlerta('⚙️ Configure a API antes de importar', 'warning');
            UI.mostrarConfig();
            return;
        }

        // Confirmar ação
        const confirmar = confirm(
            `🚀 Importar todos os itens deste módulo?\n\n` +
            `Isso importará ${methods.length} tipos de dados.\n\n` +
            `Deseja continuar?`
        );

        if (!confirmar) return;

        // Desabilitar botão durante importação
        button.disabled = true;
        const originalText = button.textContent;
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

                // Encontrar o botão correspondente para pegar o item
                const actionName = this.methodToAction(method);
                const itemButton = document.querySelector(`[data-action="${actionName}"]`);
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
                UI.mostrarAlerta(`✅ Módulo importado com sucesso!`, 'success');
            } else {
                UI.mostrarAlerta(
                    `⚠️ Importação concluída com ${errorCount} erro(s).\n` +
                    `${successCount} item(ns) importado(s) com sucesso.`,
                    'warning'
                );
            }
        } catch (error) {
            UI.mostrarAlerta(`❌ Erro na importação: ${error.message}`, 'error');
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    },

    /**
     * Converter nome do método para nome da ação (data-action)
     */
    methodToAction(method) {
        const mapping = {
            'importarSecoes': 'importar-secao',
            'importarGrupos': 'importar-grupos',
            'importarSubgrupos': 'importar-subgrupos',
            'importarMarcas': 'importar-marcas',
            'importarFamilias': 'importar-familias',
            'importarProdutos': 'importar-produtos',
            'importarLojas': 'importar-lojas',
            'importarClientes': 'importar-clientes',
            'importarFornecedores': 'importar-fornecedores',
            'importarCategorias': 'importar-categorias',
            'importarAgentes': 'importar-agentes',
            'importarContasCorrentes': 'importar-contas-correntes',
            'importarEspeciesDocumento': 'importar-especies-documento',
            'importarHistoricoPadrao': 'importar-historico-padrao',
            'importarCaixas': 'importar-caixas',
            'importarMotivosCancelamento': 'importar-motivos-cancelamento',
            'importarMotivosDesconto': 'importar-motivos-desconto',
            'importarMotivosDevolucao': 'importar-motivos-devolucao',
            'importarPagamentosPDV': 'importar-formas-pagamento',
            'importarRecebimentosPDV': 'importar-formas-recebimento',
            'importarLocalEstoque': 'importar-locais-estoque',
            'importarTiposAjustes': 'importar-tipos-ajustes',
            'importarImpostosFederais': 'importar-impostos-federais',
            'importarRegimeTributario': 'importar-regime-tributario',
            'importarSituacoesFiscais': 'importar-situacoes-fiscais',
            'importarTabelasTributariasEntrada': 'importar-tabelas-entrada',
            'importarTabelasTributariasSaida': 'importar-tabelas-saida',
            'importarTiposOperacoes': 'importar-tipos-operacoes'
        };

        return mapping[method] || method;
    },

    /**
     * Atualizar status de um item de importação
     */
    updateItemStatus(item, status, message = '') {
        if (!item) return;

        const statusEl = item.querySelector('.import-item-status');
        const progressBar = item.querySelector('.import-item-progress-fill');

        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'import-item-status';
            
            if (status === 'success') {
                statusEl.classList.add('success');
            } else if (status === 'error') {
                statusEl.classList.add('error');
            } else if (status === 'loading') {
                statusEl.classList.add('loading');
            }
        }

        if (progressBar) {
            if (status === 'success') {
                progressBar.style.width = '100%';
            } else if (status === 'loading') {
                progressBar.style.width = '50%';
            } else if (status === 'error') {
                progressBar.style.width = '0%';
            }
        }
    }
};

// Exportar para uso global
export default Tabs;