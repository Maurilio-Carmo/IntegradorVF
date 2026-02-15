// frontend/src/ui/tabs.js

/**
 * Gerenciador de Tabs
 * Controla navegação e estado das abas de importação
 */

import UI from './ui.js';
import Config from '../services/config.js';
import Importacao from '../features/importacao.js';

const TabsManager = {
    /**
     * Inicializar tabs
     */
    init() {
        // Event listeners para os botões de aba
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Event listeners para botões "Importar Tudo" de cada módulo
        this.setupBulkImportButtons();

        console.log('✅ Tabs inicializadas');
    },

    /**
     * Trocar de aba
     */
    switchTab(tabName) {
        // Desativar todas as abas
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Ativar aba selecionada
        const button = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
        const panel = document.querySelector(`.tab-panel[data-panel="${tabName}"]`);

        if (button && panel) {
            button.classList.add('active');
            panel.classList.add('active');
        }
    },

    /**
     * Configurar botões de importação em massa por módulo
     */
    setupBulkImportButtons() {
        const bulkButtons = {
            'btnImportarTudoProduto': ['importar-hierarquia', 'importar-marcas', 'importar-produtos', 'importar-familias'],
            'btnImportarTudoFinanceiro': ['importar-categorias', 'importar-agentes', 'importar-contas', 'importar-formas-pagamento'],
            'btnImportarTudoFrenteLoja': ['importar-caixas', 'importar-pagamentos-pdv', 'importar-recebimentos-pdv'],
            'btnImportarTudoEstoque': ['importar-locais-estoque', 'importar-tipos-ajustes'],
            'btnImportarTudoFiscal': ['importar-regime-tributario', 'importar-situacoes-fiscais', 'importar-tipos-operacoes'],
            'btnImportarTudoPessoa': ['importar-lojas', 'importar-clientes', 'importar-fornecedores']
        };

        Object.entries(bulkButtons).forEach(([buttonId, actions]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', async () => {
                    const confirmar = confirm(
                        `Deseja importar todos os itens deste módulo?\n\n` +
                        `Isso importará ${actions.length} tipos de dados.`
                    );

                    if (!confirmar) return;

                    // Desabilitar botão durante importação
                    button.disabled = true;
                    const originalText = button.textContent;
                    button.textContent = '⏳ Importando...';

                    try {
                        for (const action of actions) {
                            const item = document.querySelector(`[data-action="${action}"]`).closest('.import-item');
                            await this.triggerImport(action, item);
                        }

                        UI.mostrarAlerta('✅ Módulo importado com sucesso!', 'success');
                    } catch (error) {
                        UI.mostrarAlerta(`❌ Erro na importação: ${error.message}`, 'error');
                    } finally {
                        button.disabled = false;
                        button.textContent = originalText;
                    }
                });
            }
        });
    },

    /**
     * Disparar importação de um item
     */
    async triggerImport(action, item) {
        // Verificar se está configurado
        if (!Config.estaConfigurado()) {
            UI.mostrarAlerta('Configure a API antes de importar', 'error');
            UI.mostrarConfig();
            throw new Error('API não configurada');
        }

        try {
            switch (action) {
                case 'importar-hierarquia':
                    await Importacao.importarHierarquia(item);
                    break;
                case 'importar-marcas':
                    await Importacao.importarMarcas(item);
                    break;
                case 'importar-produtos':
                    await Importacao.importarProdutos(item);
                    break;
                case 'importar-clientes':
                    await Importacao.importarClientes(item);
                    break;
                case 'importar-fornecedores':
                    await Importacao.importarFornecedores(item);
                    break;
                case 'importar-categorias':
                    await Importacao.importarCategorias(item);
                    break;
                // Adicionar mais casos conforme implementado
                default:
                    UI.log(`⚠️  Importação de "${action}" ainda não implementada`, 'info');
                    this.updateItemStatus(item, 'loading', 'Em desenvolvimento');
            }
        } catch (error) {
            console.error(`Erro ao importar ${action}:`, error);
            throw error;
        }
    },

    /**
     * Atualizar status visual do item
     */
    updateItemStatus(item, status, message = '') {
        const statusDiv = item.querySelector('.import-item-status');
        const progressBar = item.querySelector('.import-item-progress');
        const progressFill = item.querySelector('.import-item-progress-fill');
        const button = item.querySelector('.btn');

        switch (status) {
            case 'loading':
                button.disabled = true;
                button.textContent = '⏳ Processando...';
                progressBar.classList.add('active');
                statusDiv.className = 'import-item-status loading';
                statusDiv.textContent = message;
                break;

            case 'progress':
                progressFill.style.width = `${message}%`;
                break;

            case 'success':
                button.disabled = false;
                button.textContent = 'Importar';
                progressBar.classList.remove('active');
                statusDiv.className = 'import-item-status success';
                statusDiv.textContent = `✅ ${message}`;
                setTimeout(() => {
                    statusDiv.textContent = '';
                    statusDiv.className = 'import-item-status';
                }, 5000);
                break;

            case 'error':
                button.disabled = false;
                button.textContent = 'Importar';
                progressBar.classList.remove('active');
                statusDiv.className = 'import-item-status error';
                statusDiv.textContent = `❌ ${message}`;
                break;
        }
    }
};

// Inicializar quando componentes carregarem
document.addEventListener('componentsLoaded', () => {
    TabsManager.init();
});

// Exportar para uso global
export default TabsManager;