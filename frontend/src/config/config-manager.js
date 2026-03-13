// frontend/src/config/config-manager.js
//
// ─── CORREÇÃO DE CONTINUIDADE ────────────────────────────────────────────────
//
// BUG 3 — Double POST /api/credencial ao salvar:
//   config.js.salvar() já envia POST /api/credencial.
//   config-manager.js.salvar() também enviava POST independentemente.
//   CORREÇÃO: config-manager só chama await Config.salvar({...}).
//   Config.salvar() trata localStorage + backend em uma só chamada.
//
// BUG 4 — Config.limpar() sem await + double DELETE:
//   config.js.limpar() é async e já chama DELETE /api/credencial.
//   config-manager.js chamava Config.limpar() sem await + seu próprio DELETE.
//   CORREÇÃO: await Config.limpar() — ela já cuida de tudo.
//
// ─────────────────────────────────────────────────────────────────────────────

import Config from '../services/config.js';
import Tabs   from '../ui/tabs/tabs-manager.js';
import UI     from '../ui/ui.js';
import { API } from '../config/constants.js';

const BACKEND = API.PROXY_BASE ?? '';

export const ConfigManager = {

    async carregar() {
        const config = Config.carregar();

        if (!config) {
            console.log('⚠️ Nenhuma configuração encontrada');
            UI.log('⚠️ Configure a API para começar', 'warning');
            UI.atualizarStatusConexao(false);
            return null;
        }

        console.log('⚙️ Configuração encontrada');
        this.preencherFormulario(config);
        await this.testarConexaoSilencioso();
        UI.log('✅ Configuração carregada', 'success');
        return config;
    },

    /**
     * CORRIGIDO: não mais faz fetch POST independente.
     * Config.salvar() já persiste em localStorage + POST /api/credencial.
     */
    async salvar(apiUrl, apiKey, loja) {
        if (!apiUrl || !apiKey || !loja) {
            UI.mostrarAlerta('Preencha todos os campos', 'error');
            return { success: false, error: 'Campos obrigatórios não preenchidos' };
        }

        const validacao = Config.validar(apiUrl, apiKey, loja);
        if (!validacao.valido) {
            UI.mostrarAlerta(validacao.erros.join('\n'), 'error');
            return { success: false, error: validacao.erros.join(', ') };
        }

        // Uma única chamada: localStorage + POST /api/credencial
        try {
            await Config.salvar({ apiUrl, apiKey, loja });
        } catch (err) {
            console.warn('[config-manager] Falha ao salvar credenciais:', err.message);
        }

        const btnTestar = document.getElementById('btnTestarConexao');
        this.setBotaoCarregando(btnTestar, true);

        try {
            const resultado = await this._testarConexaoSalva();

            if (resultado.success) {
                UI.atualizarStatusConexao(true);
                UI.log('💾 Configuração salva e conectada!', 'success');
                UI.mostrarAlerta('✅ Configuração salva e conectada com sucesso!', 'success');

                setTimeout(() => {
                    UI.fecharConfig();
                    Tabs.goTo('pessoa');
                    const btnLojas = document.querySelector('[data-action="importar-lojas"]');
                    if (btnLojas) btnLojas.click();
                }, 1500);

                return { success: true };
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

    async testar(apiUrl, apiKey, loja) {
        if (!apiUrl || !apiKey || !loja) {
            UI.mostrarAlerta('Preencha todos os campos antes de testar', 'error');
            return { success: false, error: 'Campos obrigatórios não preenchidos' };
        }

        const btnTestar = document.getElementById('btnTestarConexao');
        this.setBotaoCarregando(btnTestar, true);

        try {
            const res = await fetch(`${BACKEND}/api/credencial/testar-conexao`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ urlApi: apiUrl, tokenApi: apiKey, lojaId: Number(loja) }),
            });

            const resultado = await res.json();

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

    async testarConexaoSilencioso() {
        try {
            const resultado = await this._testarConexaoSalva();
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

    preencherFormulario(config) {
        const form = document.getElementById('formConfig');
        if (!form) return;

        const urlInput  = form.querySelector('#apiUrl');
        const keyInput  = form.querySelector('#apiKey');
        const lojaInput = form.querySelector('#apiLoja');

        if (urlInput)  urlInput.value  = config.apiUrl || '';
        if (keyInput)  keyInput.value  = config.apiKey || '';
        if (lojaInput) lojaInput.value = config.loja   || '';
    },

    obterDadosFormulario() {
        const form = document.getElementById('formConfig');
        if (!form) return null;

        return {
            apiUrl: form.querySelector('#apiUrl')?.value.trim()     || '',
            apiKey: form.querySelector('#apiKey')?.value.trim()     || '',
            loja:   parseInt(form.querySelector('#apiLoja')?.value) || 0,
        };
    },

    /**
     * CORRIGIDO: await Config.limpar() (é async).
     * Config.limpar() já remove localStorage + DELETE /api/credencial.
     * Removido fetch DELETE redundante que existia aqui antes.
     */
    async limpar() {
        await Config.limpar();
        UI.atualizarStatusConexao(false);
        UI.log('🗑️ Configuração removida', 'info');
    },

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
    },

    async _testarConexaoSalva() {
        const res = await fetch(`${BACKEND}/api/credencial/testar-conexao`);
        if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
        return res.json();
    },
};

export default ConfigManager;
