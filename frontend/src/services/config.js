// frontend/src/services/config.js

/**
 * Módulo de Configuração
 * Gerencia credenciais e configurações da API
 */


const Config = {
    storageKey: 'varejoFacilConfig',

    /**
     * Salvar configurações no localStorage
     * @param {Object} dados - { apiUrl, apiKey, apiLoja }
     */
    salvar(dados) {
        localStorage.setItem(this.storageKey, JSON.stringify(dados));
        console.log('✅ Configuração salva');
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
        return config && config.apiUrl && config.apiKey && config.apiLoja;
    },

    /**
     * Limpar configurações do localStorage
     */
    limpar() {
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ Configuração limpa');
    },

    /**
     * Validar formato da URL
     * @param {string} url
     * @returns {boolean}
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
     * @param {string} apiKey
     * @returns {boolean}
     */
    validarApiKey(apiKey) {
        return apiKey && apiKey.length >= 10;
    },

    /**
     * Validar código da loja
     * @param {string} loja
     * @returns {boolean}
     */
    validarLoja(loja) {
        const lojaNum = parseInt(loja);
        return !isNaN(lojaNum) && lojaNum > 0;
    },

    /**
     * Validar todas as configurações
     * @param {string} apiUrl
     * @param {string} apiKey
     * @param {string} apiLoja
     * @returns {Object} { valido: boolean, erros: string[] }
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

// Exportar para uso global
export default Config;