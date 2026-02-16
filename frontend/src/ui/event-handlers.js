// frontend/src/ui/event-handlers.js

/**
 * Gerenciador de Event Handlers
 * Centraliza todos os event listeners da aplicação
 */

import UI from './ui.js';
import ConfigManager from '../config/config-manager.js';

export const EventHandlers = {
    /**
     * Configurar todos os event listeners
     */
    setup() {
        this.setupConfigHandlers();
        this.setupUIHandlers();
        this.setupKeyboardHandlers();
        this.setupThemeHandlers();
        
        console.log('✅ Event handlers configurados');
    },

    /**
     * Handlers de configuração
     */
    setupConfigHandlers() {
        // Botão de abrir configuração
        const btnConfig = document.getElementById('btnConfig');
        if (btnConfig) {
            btnConfig.addEventListener('click', () => {
                UI.mostrarConfig();
            });
        }

        // Botões de fechar configuração
        this.setupCloseConfigButtons();

        // Toggle de senha
        const btnTogglePassword = document.getElementById('btnTogglePassword');
        if (btnTogglePassword) {
            btnTogglePassword.addEventListener('click', this.toggleSenha);
        }

        // Formulário de configuração
        const formConfig = document.getElementById('formConfig');
        if (formConfig) {
            formConfig.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSalvarConfig();
            });
        }

        // Botão de testar conexão
        const btnTestarConexao = document.getElementById('btnTestarConexao');
        if (btnTestarConexao) {
            btnTestarConexao.addEventListener('click', async () => {
                await this.handleTestarConexao();
            });
        }
    },

    /**
     * Configurar botões de fechar configuração
     */
    setupCloseConfigButtons() {
        const closeButtons = [
            document.getElementById('btnFecharConfig'),
            document.getElementById('btnCloseConfig')
        ];

        closeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    UI.fecharConfig();
                });
            }
        });
    },

    /**
     * Handlers de UI geral
     */
    setupUIHandlers() {
        // Botão de limpar log
        const btnLimparLog = document.getElementById('btnLimparLog');
        if (btnLimparLog) {
            btnLimparLog.addEventListener('click', () => {
                UI.limparLog();
            });
        }

        // Fechar modal ao clicar fora
        const sectionConfig = document.getElementById('sectionConfig');
        if (sectionConfig) {
            sectionConfig.addEventListener('click', (e) => {
                if (e.target === sectionConfig) {
                    UI.fecharConfig();
                }
            });
        }
    },

    /**
     * Handlers de teclado
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            // ESC para fechar modal
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    },

    /**
     * Handlers de tema
     */
    setupThemeHandlers() {
        document.addEventListener('themeChanged', (e) => {
            const tema = e.detail.theme;
            console.log(`🎨 Tema alterado para: ${tema}`);
            UI.log(`🎨 Tema alterado para: ${tema}`, 'info');
        });
    },

    /**
     * Handler: Salvar configuração
     */
    async handleSalvarConfig() {
        const dados = ConfigManager.obterDadosFormulario();
        if (!dados) {
            UI.mostrarAlerta('❌ Erro ao obter dados do formulário', 'error');
            return;
        }

        await ConfigManager.salvar(dados.apiUrl, dados.apiKey, dados.loja);
    },

    /**
     * Handler: Testar conexão
     */
    async handleTestarConexao() {
        const dados = ConfigManager.obterDadosFormulario();
        if (!dados) {
            UI.mostrarAlerta('❌ Erro ao obter dados do formulário', 'error');
            return;
        }

        await ConfigManager.testar(dados.apiUrl, dados.apiKey, dados.loja);
    },

    /**
     * Handler: Tecla ESC
     */
    handleEscapeKey() {
        const section = document.getElementById('sectionConfig');
        if (section && section.style.display === 'block') {
            UI.fecharConfig();
        }
    },

    /**
     * Toggle de visibilidade de senha
     */
    toggleSenha() {
        const input = document.getElementById('apiKey');
        const icon = document.querySelector('#btnTogglePassword span');
        
        if (!input) return;

        if (input.type === 'password') {
            input.type = 'text';
            if (icon) icon.textContent = '🙈';
        } else {
            input.type = 'password';
            if (icon) icon.textContent = '👁️';
        }
    },

    /**
     * Remover todos os event listeners (cleanup)
     */
    cleanup() {
        // Implementar se necessário para evitar memory leaks
        console.log('🧹 Limpando event handlers...');
    }
};

export default EventHandlers;