// frontend/src/services/config.js

/**
 * Módulo de Configuração
 * Gerencia credenciais localmente (localStorage) e no backend (SQLite via API).
 *
 * CORREÇÃO: o método salvar() agora envia os campos com os nomes corretos
 * que o backend espera:
 *   backend DTO → { lojaId: number, urlApi: string, tokenApi: string }
 *   frontend antes enviava → { loja, apiUrl, apiKey }  ← causava 400
 */

const Config = {
    storageKey: 'varejoFacilConfig',

    /**
     * Salvar configurações no localStorage E persistir no backend.
     * @param {Object} dados - { apiUrl, apiKey, loja }
     */
    async salvar(dados) {
        // 1. Salva localmente (nomenclatura interna do frontend)
        localStorage.setItem(this.storageKey, JSON.stringify(dados));
        console.log('✅ Configuração salva localmente');

        // 2. Persiste no backend com os nomes de campo corretos do DTO
        try {
            const res = await fetch('/api/credencial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lojaId:   Number(dados.loja),   // backend: lojaId  (number)
                    urlApi:   dados.apiUrl,          // backend: urlApi
                    tokenApi: dados.apiKey,          // backend: tokenApi
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('❌ Config.salvar:', err);
                throw new Error(err.message ?? `HTTP ${res.status}`);
            }

            console.log('✅ Credenciais persistidas no backend');
        } catch (error) {
            // Lança para que config-manager.js possa tratar e exibir alerta
            throw error;
        }
    },

    /**
     * Carregar configurações do localStorage
     * @returns {Object|null} Dados salvos ou null
     */
    carregar() {
        const dados = localStorage.getItem(this.storageKey);
        return dados ? JSON.parse(dados) : null;
    },

    /**
     * Verificar se está configurado
     * @returns {boolean}
     */
    estaConfigurado() {
        const config = this.carregar();
        const configurado = config && config.apiUrl && config.apiKey && config.loja;

        console.log('🔍 Verificando configuração:', {
            existe:    !!config,
            temUrl:    !!config?.apiUrl,
            temKey:    !!config?.apiKey,
            temLoja:   !!config?.loja,
            resultado: configurado
        });

        return configurado;
    },

    /**
     * Limpar configurações do localStorage e do backend
     */
    async limpar() {
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ Configuração local removida');

        try {
            await fetch('/api/credencial', { method: 'DELETE' });
            console.log('🗑️ Credenciais removidas do backend');
        } catch (err) {
            console.warn('⚠️ Erro ao limpar credenciais no backend:', err.message);
        }
    },

    /**
     * Validar formato da URL
     */
    validarUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
            return false;
        }
    },

    /**
     * Validar formato da API Key
     */
    validarApiKey(apiKey) {
        return apiKey && apiKey.length >= 10;
    },

    /**
     * Validar código da loja
     */
    validarLoja(loja) {
        const lojaNum = parseInt(loja);
        return !isNaN(lojaNum) && lojaNum > 0;
    },

    /**
     * Validar todas as configurações
     */
    validar(apiUrl, apiKey, loja) {
        const erros = [];

        if (!this.validarUrl(apiUrl)) {
            erros.push('URL da API inválida');
        }

        if (!this.validarApiKey(apiKey)) {
            erros.push('API Key inválida (mínimo 10 caracteres)');
        }

        if (!this.validarLoja(loja)) {
            erros.push('Código da loja inválido');
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }
};

export default Config;