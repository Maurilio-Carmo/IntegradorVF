// frontend/src/config/config-manager.js
//
// ─── FASE 3 — REFATORAÇÃO (refactor/migrate-api-to-backend) ─────────────────
//
// ANTES:
//   import API from '../services/api/index.js';
//   await API.configurar(apiUrl, apiKey, loja);   // configura o cliente HTTP do browser
//   await API.testarConexao();                     // browser chama API VF diretamente
//
// DEPOIS:
//   Sem import de API. O teste de conexão é delegado ao backend.
//   O frontend apenas faz fetch('/api/credencial/testar-conexao').
//
// MOTIVO:
//   - Elimina a última dependência de services/api/ no código ativo
//   - Credenciais não mais trafegam pelo browser em chamadas à API externa
//   - Permite remover toda a pasta frontend/src/services/api/
//
// FLUXO NOVO:
//   salvar()                → POST /api/credencial (salva no SQLite)
//                           → GET  /api/credencial/testar-conexao (testa do backend)
//   testar()                → POST /api/credencial/testar-conexao (body = campos do form)
//   testarConexaoSilencioso → GET  /api/credencial/testar-conexao (usa credenciais salvas)
// ─────────────────────────────────────────────────────────────────────────────

import Config from '../services/config.js';
import Tabs   from '../ui/tabs/tabs-manager.js';
import UI     from '../ui/ui.js';
import { API } from '../config/constants.js';  // apenas para API.PROXY_BASE (URL do backend)

/** Base do backend — ex: http://localhost:3000 */
const BACKEND = API.PROXY_BASE ?? '';

export const ConfigManager = {

    /**
     * Carregar configuração salva e testar conexão silenciosamente.
     * Chamado no boot da aplicação (app-initializer.js).
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
        this.preencherFormulario(config);

        // Testa usando as credenciais já salvas no SQLite (via backend)
        await this.testarConexaoSilencioso();

        UI.log('✅ Configuração carregada', 'success');
        return config;
    },

    /**
     * Salvar configuração e testar conexão.
     *
     * Fluxo:
     *  1. Valida campos
     *  2. Salva no localStorage (Config) — mantém paridade com a UI
     *  3. Salva no SQLite via POST /api/credencial — backend precisa para os jobs
     *  4. Testa a conexão via GET /api/credencial/testar-conexao
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

        // 1. Persiste no localStorage (para preencher o form no próximo boot)
        Config.salvar({ apiUrl, apiKey, loja });

        // 2. Persiste no SQLite (backend precisa para os jobs de importação)
        try {
            const res = await fetch(`${BACKEND}/api/credencial`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ urlApi: apiUrl, tokenApi: apiKey, lojaId: Number(loja) }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message ?? `HTTP ${res.status}`);
            }
        } catch (err) {
            // Falha ao salvar no SQLite não é bloqueante — loga e continua
            console.warn('[config-manager] Falha ao salvar credencial no backend:', err.message);
        }

        // 3. Testa usando as credenciais recém-salvas
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

    /**
     * Testar conexão com credenciais fornecidas nos campos do formulário.
     * Usado quando o usuário clica em "Testar Conexão" antes de salvar.
     *
     * Envia as credenciais ao backend via POST — o backend testa sem persistir.
     */
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
                body:    JSON.stringify({
                    urlApi:   apiUrl,
                    tokenApi: apiKey,
                    lojaId:   Number(loja),
                }),
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

    /**
     * Testa conexão silenciosamente (sem alertas visuais).
     * Usado no boot para verificar se as credenciais salvas ainda funcionam.
     */
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

    /**
     * Preencher formulário com configuração salva no localStorage.
     */
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

    /**
     * Obter dados do formulário.
     */
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
     * Limpar configuração do localStorage e do SQLite.
     */
    async limpar() {
        Config.limpar();
        UI.atualizarStatusConexao(false);
        UI.log('🗑️ Configuração removida', 'info');

        // Remove do SQLite também (ignorar erro se backend estiver fora)
        fetch(`${BACKEND}/api/credencial`, { method: 'DELETE' }).catch(() => {});
    },

    /**
     * Definir estado de carregamento do botão de teste.
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
    },

    // ─── Privado ──────────────────────────────────────────────────────────────

    /**
     * Chama GET /api/credencial/testar-conexao (usa credenciais do SQLite).
     * Interno — use testarConexaoSilencioso() ou testar() externamente.
     */
    async _testarConexaoSalva() {
        const res = await fetch(`${BACKEND}/api/credencial/testar-conexao`);

        if (!res.ok) {
            return { success: false, error: `HTTP ${res.status}` };
        }

        return res.json();
    },
};

export default ConfigManager;
