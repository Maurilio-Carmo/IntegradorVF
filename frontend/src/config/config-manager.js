// frontend/src/config/config-manager.js

/**
 * Gerenciador de Configuração
 * Responsável por carregar, salvar e testar configurações da API
 */

import Config from '../services/config.js';
import API from '../services/api/index.js';
import UI from '../ui/ui.js';

export const ConfigManager = {
    /**
     * Carregar configuração salva
     */
    async carregar() {
        const config = Config.carregar();
        
        if (!config) {
            console.log('⚠️ Nenhuma configuração encontrada');
            UI.log('⚠️ Configure a API para começar', 'warning');
            UI.atualizarStatusConexao(false);
            return null;
        }

        console.log('⚙️ Configuração encontrada');
        API.configurar(config.apiUrl, config.apiKey, config.loja);
        
        // Preencher formulário se existir
        this.preencherFormulario(config);

        // Testar conexão automaticamente
        await this.testarConexaoSilencioso();

        UI.log('✅ Configuração carregada', 'success');
        return config;
    },

    /**
     * Salvar configuração
     */
    async salvar(apiUrl, apiKey, loja) {
        // Validar campos
        if (!apiUrl || !apiKey || !loja) {
            UI.mostrarAlerta('Preencha todos os campos', 'error');
            return { success: false, error: 'Campos obrigatórios não preenchidos' };
        }

        // Validar formato
        const validacao = Config.validar(apiUrl, apiKey, loja);
        if (!validacao.valido) {
            UI.mostrarAlerta(validacao.erros.join('\n'), 'error');
            return { success: false, error: validacao.erros.join(', ') };
        }

        // Salvar no localStorage
        Config.salvar({ apiUrl, apiKey, loja });
        API.configurar(apiUrl, apiKey, loja);

        // Testar conexão automaticamente
        const btnTestar = document.getElementById('btnTestarConexao');
        this.setBotaoCarregando(btnTestar, true);

        try {
            const resultado = await API.testarConexao();
            
            if (resultado.success) {
                UI.atualizarStatusConexao(true);
                UI.log('💾 Configuração salva e conectada!', 'success');
                UI.mostrarAlerta('✅ Configuração salva e conectada com sucesso!', 'success');
                
                // Fechar modal após delay
                setTimeout(() => UI.fecharConfig(), 1500);
                
                return { success: true, data: resultado.data };
            } else {
                UI.atualizarStatusConexao(false);
                UI.mostrarAlerta('⚠️ Configuração salva, mas falha na conexão: ' + resultado.error, 'warning');
                return { success: false, error: resultado.error };
            }
        } catch (error) {
            UI.atualizarStatusConexao(false);
            UI.mostrarAlerta('⚠️ Configuração salva, mas erro ao testar: ' + error.message, 'warning');
            return { success: false, error: error.message };
        } finally {
            this.setBotaoCarregando(btnTestar, false);
        }
    },

    /**
     * Testar conexão com a API
     */
    async testar(apiUrl, apiKey, loja) {
        // Validar campos
        if (!apiUrl || !apiKey || !loja) {
            UI.mostrarAlerta('Preencha todos os campos antes de testar', 'error');
            return { success: false, error: 'Campos obrigatórios não preenchidos' };
        }

        // Configurar temporariamente
        API.configurar(apiUrl, apiKey, loja);

        const btnTestar = document.getElementById('btnTestarConexao');
        this.setBotaoCarregando(btnTestar, true);

        try {
            const resultado = await API.testarConexao();
            
            if (resultado.success) {
                UI.atualizarStatusConexao(true);
                UI.mostrarAlerta('✅ Conexão estabelecida com sucesso!', 'success');
            } else {
                UI.atualizarStatusConexao(false);
                UI.mostrarAlerta('❌ Falha na conexão: ' + resultado.error, 'error');
            }
            
            return resultado;
        } catch (error) {
            UI.atualizarStatusConexao(false);
            UI.mostrarAlerta('❌ Erro ao testar: ' + error.message, 'error');
            return { success: false, error: error.message };
        } finally {
            this.setBotaoCarregando(btnTestar, false);
        }
    },

    /**
     * Testar conexão silenciosamente (sem alertas)
     */
    async testarConexaoSilencioso() {
        try {
            const resultado = await API.testarConexao();
            
            if (resultado.success) {
                UI.atualizarStatusConexao(true);
                UI.log('✅ Conectado à API', 'success');
            } else {
                UI.atualizarStatusConexao(false);
            }
            
            return resultado;
        } catch (error) {
            UI.atualizarStatusConexao(false);
            return { success: false, error: error.message };
        }
    },

    /**
     * Preencher formulário com configuração
     */
    preencherFormulario(config) {
        const form = document.getElementById('formConfig');
        if (!form) return;

        const urlInput = form.querySelector('#apiUrl');
        const keyInput = form.querySelector('#apiKey');
        const lojaInput = form.querySelector('#apiLoja');

        if (urlInput) urlInput.value = config.apiUrl || '';
        if (keyInput) keyInput.value = config.apiKey || '';
        if (lojaInput) lojaInput.value = config.loja || '';
    },

    /**
     * Obter dados do formulário
     */
    obterDadosFormulario() {
        const form = document.getElementById('formConfig');
        if (!form) return null;

        return {
            apiUrl: form.querySelector('#apiUrl')?.value.trim() || '',
            apiKey: form.querySelector('#apiKey')?.value.trim() || '',
            loja: parseInt(form.querySelector('#apiLoja')?.value) || 0
        };
    },

    /**
     * Limpar configuração
     */
    limpar() {
        Config.limpar();
        UI.atualizarStatusConexao(false);
        UI.log('🗑️ Configuração removida', 'info');
    },

    /**
     * Definir estado de carregamento do botão
     */
    setBotaoCarregando(button, carregando) {
        if (!button) return;

        if (carregando) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = '🔄 Testando...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || '🔗 Testar Conexão';
        }
    }
};

export default ConfigManager;