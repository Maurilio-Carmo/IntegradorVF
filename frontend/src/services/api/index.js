// frontend/src/services/api/index.js

/**
 * API Client Principal (Modularizado)
 * Agrega todos os módulos de API e mantém compatibilidade com código legado
 */

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
import UI from '../../ui/ui.js';

/**
 * Cliente de API Modularizado
 */
class VarejoFacilAPI {
    constructor() {
        this.proxyURL = 'http://localhost:3000/api/vf';
        
        // Criar HttpClient base
        this.http = new HttpClient(this.proxyURL);

        // Inicializar módulos
        this.produto = new ProdutoAPI(this.proxyURL);
        this.pessoa = new PessoaAPI(this.proxyURL);
        this.financeiro = new FinanceiroAPI(this.proxyURL);
        this.pdv = new PDVAPI(this.proxyURL);
        this.fiscal = new FiscalAPI(this.proxyURL);
        this.estoque = new EstoqueAPI(this.proxyURL);
        this.administracao = new AdministracaoAPI(this.proxyURL);

        // Credenciais
        this.apiUrl = null;
        this.apiKey = null;
        this.loja = null;
    }

    /**
     * Configurar API (propaga para todos os módulos)
     */
    configurar(apiUrl, apiKey, loja) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.loja = loja;

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

    /**
     * Buscar dados com paginação
     */
    async fetchPaginated(endpoint, start = 0, count = 500) {
        return await this.http.get(endpoint, { start, count, sort: 'id' });
    }

    /**
     * Importar múltiplos endpoints de uma vez
     */
    async importarMultiplos(endpoints) {
        const resultados = {};
        
        for (const endpoint of endpoints) {
            try {
                UI.log(`📥 Importando ${endpoint.nome}...`, 'info');
                
                const dados = await endpoint.metodo(endpoint.onProgress);
                
                resultados[endpoint.nome] = {
                    sucesso: true,
                    total: dados.length,
                    dados: dados
                };
                
                UI.log(`✅ ${endpoint.nome}: ${dados.length} registros`, 'success');
                
            } catch (error) {
                resultados[endpoint.nome] = {
                    sucesso: false,
                    erro: error.message
                };
                
                UI.log(`❌ Erro em ${endpoint.nome}: ${error.message}`, 'error');
            }
        }
        
        return resultados;
    }
}

// Criar instância singleton
const API = new VarejoFacilAPI();

// Exportar instância e classe
export { VarejoFacilAPI, API };
export default API;