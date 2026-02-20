// frontend/src/services/api/index.js

/**
 * API Client Principal (Modularizado)
 * Agrega todos os módulos de API e mantém compatibilidade com código legado
 */

import { API as API_CONFIG } from '../../config/constants.js';
import HttpClient from './http-client.js';
import {
    ProdutoAPI,
    FinanceiroAPI,
    PDVAPI,
    EstoqueAPI,
    FiscalAPI,
    PessoaAPI,
    AdministracaoAPI
} from './modules.js';

/**
 * Cliente de API Modularizado
 */
class VarejoFacilAPI {
    constructor() {
        // Criar HttpClient base
        this.proxyURL = API_CONFIG.PROXY_URL;
        this.http = new HttpClient(this.proxyURL);

        // Inicializar módulos
        this.produto       = new ProdutoAPI(this.proxyURL);
        this.financeiro    = new FinanceiroAPI(this.proxyURL);
        this.pdv           = new PDVAPI(this.proxyURL);
        this.estoque       = new EstoqueAPI(this.proxyURL);
        this.fiscal        = new FiscalAPI(this.proxyURL);
        this.pessoa        = new PessoaAPI(this.proxyURL);
        this.administracao = new AdministracaoAPI(this.proxyURL);

        // Credenciais
        this.apiUrl = null;
        this.apiKey = null;
        this.loja   = null;
    }

    /**
     * Configurar API (propaga para todos os módulos)
     */
    configurar(apiUrl, apiKey, loja) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.loja   = loja;

        // Configurar todos os módulos
        const modules = [
            this.produto,
            this.pessoa,
            this.financeiro,
            this.pdv,
            this.fiscal,
            this.estoque,
            this.administracao
        ];

        modules.forEach(module => {
            module.configure(apiUrl, apiKey, loja);
        });

        // Configurar HttpClient principal
        this.http.setHeaders({
            'x-api-url': this.apiUrl.replace(/\/$/, '').replace('/api/v1', '') + '/api/v1',
            'x-api-key': this.apiKey
        });

        console.log('⚙️ API configurada:', this.apiUrl);
    }

    /**
     * Testar conexão
     */
    async testarConexao() {
        return await this.administracao.testConnection();
    }
}

// Criar instância singleton
const API = new VarejoFacilAPI();

// Exportar instância e classe
export { VarejoFacilAPI, API };
export default API;