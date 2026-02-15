// frontend/src/config.js

/**
 * Módulo de Configuração
 * Gerencia credenciais e configurações da API
 */

const Config = {
    // Chaves do localStorage
    STORAGE_KEYS: {
        API_URL: 'vf_api_url',
        API_KEY: 'vf_api_key',
        API_LOJA: 'vf_api_loja',
        SAVE_CREDENTIALS: 'vf_save_credentials'
    },

    /**
     * Salvar configurações no localStorage
     */
    salvar(apiUrl, apiKey, apiLoja, salvarCredenciais) {
        if (salvarCredenciais) {
            localStorage.setItem(this.STORAGE_KEYS.API_URL, apiUrl);
            localStorage.setItem(this.STORAGE_KEYS.API_KEY, apiKey);
            localStorage.setItem(this.STORAGE_KEYS.API_LOJA, apiLoja);
            localStorage.setItem(this.STORAGE_KEYS.SAVE_CREDENTIALS, 'true');
            console.log('✅ Credenciais salvas no localStorage');
        } else {
            this.limpar();
        }
    },

    /**
     * Carregar configurações do localStorage
     */
    carregar() {
        const salvarCredenciais = localStorage.getItem(this.STORAGE_KEYS.SAVE_CREDENTIALS) === 'true';
        
        if (salvarCredenciais) {
            return {
                apiUrl: localStorage.getItem(this.STORAGE_KEYS.API_URL) || '',
                apiKey: localStorage.getItem(this.STORAGE_KEYS.API_KEY) || '',
                apiLoja: localStorage.getItem(this.STORAGE_KEYS.API_LOJA) || '1',
                salvarCredenciais: true
            };
        }

        return {
            apiUrl: '',
            apiKey: '',
            apiLoja: '1',
            salvarCredenciais: false
        };
    },

    /**
     * Limpar configurações do localStorage
     */
    limpar() {
        localStorage.removeItem(this.STORAGE_KEYS.API_URL);
        localStorage.removeItem(this.STORAGE_KEYS.API_KEY);
        localStorage.removeItem(this.STORAGE_KEYS.API_LOJA);
        localStorage.removeItem(this.STORAGE_KEYS.SAVE_CREDENTIALS);
        console.log('🗑️ Credenciais removidas do localStorage');
    },

    /**
     * Verificar se está configurado
     */
    estaConfigurado() {
        const config = this.carregar();
        return !!(config.apiUrl && config.apiKey && config.apiLoja);
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
    validar(apiUrl, apiKey, apiLoja) {
        const erros = [];

        if (!this.validarUrl(apiUrl)) {
            erros.push('URL da API inválida');
        }

        if (!this.validarApiKey(apiKey)) {
            erros.push('API Key inválida (mínimo 10 caracteres)');
        }

        if (!this.validarLoja(apiLoja)) {
            erros.push('Código da loja inválido');
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }
};