// frontend/src/services/api/index.js

/**
 * API Client Principal (Modularizado)
 * Agrega todos os módulos de API e mantém compatibilidade com código legado
 */

import HttpClient from './http-client.js';
import { ProdutoAPI } from './produto-api.js';
import { 
    PessoaAPI, 
    FinanceiroAPI, 
    PDVAPI, 
    FiscalAPI, 
    EstoqueAPI,
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
     * Obter headers para requisições
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-url': this.apiUrl.replace(/\/$/, '').replace('/api/v1', '') + '/api/v1',
            'x-api-key': this.apiKey
        };
    }

    /**
     * Fazer requisição GET (método legado)
     */
    async get(endpoint, params = {}) {
        return await this.http.get(endpoint, params);
    }

    // ========================================
    // MÉTODOS LEGADOS (para compatibilidade)
    // ========================================

    // Produtos
    async buscarSecoes(onProgress) {
        return await this.produto.buscarSecoes(onProgress);
    }

    async buscarGrupos(onProgress) {
        return await this.produto.buscarGrupos(onProgress);
    }

    async buscarSubgrupos(onProgress) {
        return await this.produto.buscarSubgrupos(onProgress);
    }

    async buscarMarcas(onProgress) {
        return await this.produto.buscarMarcas(onProgress);
    }

    async buscarFamilias(onProgress) {
        return await this.produto.buscarFamilias(onProgress);
    }

    async buscarProdutos(onProgress) {
        return await this.produto.buscarProdutos(onProgress);
    }

    // Pessoas
    async buscarClientes(onProgress) {
        return await this.pessoa.buscarClientes(onProgress);
    }

    async buscarFornecedores(onProgress) {
        return await this.pessoa.buscarFornecedores(onProgress);
    }

    // Financeiro
    async buscarCategorias(onProgress) {
        return await this.financeiro.buscarCategorias(onProgress);
    }

    async buscarAgentes(onProgress) {
        return await this.financeiro.buscarAgentes(onProgress);
    }

    async buscarContasCorrentes(onProgress) {
        return await this.financeiro.buscarContasCorrentes(onProgress);
    }

    async buscarEspeciesDocumento(onProgress) {
        return await this.financeiro.buscarEspeciesDocumento(onProgress);
    }

    async buscarHistoricoPadrao(onProgress) {
        return await this.financeiro.buscarHistoricoPadrao(onProgress);
    }

    // PDV
    async buscarCaixas(onProgress) {
        return await this.pdv.buscarCaixas(onProgress);
    }

    async buscarMotivosCancelamento(onProgress) {
        return await this.pdv.buscarMotivosCancelamento(onProgress);
    }

    async buscarMotivosDesconto(onProgress) {
        return await this.pdv.buscarMotivosDesconto(onProgress);
    }

    async buscarMotivosDevolucao(onProgress) {
        return await this.pdv.buscarMotivosDevolucao(onProgress);
    }

    async buscarPagamentosPDV(onProgress) {
        return await this.pdv.buscarPagamentosPDV(onProgress);
    }

    async buscarRecebimentosPDV(onProgress) {
        return await this.pdv.buscarRecebimentosPDV(onProgress);
    }

    // Fiscal
    async buscarImpostosFederais(onProgress) {
        return await this.fiscal.buscarImpostosFederais(onProgress);
    }

    async buscarRegimeTributario(onProgress) {
        return await this.fiscal.buscarRegimeTributario(onProgress);
    }

    async buscarSituacoesFiscais(onProgress) {
        return await this.fiscal.buscarSituacoesFiscais(onProgress);
    }

    async buscarTabelasTributariasEntrada(onProgress) {
        return await this.fiscal.buscarTabelasTributariasEntrada(onProgress);
    }

    async buscarTabelasTributariasSaida(onProgress) {
        return await this.fiscal.buscarTabelasTributariasSaida(onProgress);
    }

    async buscarTiposOperacoes(onProgress) {
        return await this.fiscal.buscarTiposOperacoes(onProgress);
    }

    // Estoque
    async buscarLocalEstoque(onProgress) {
        return await this.estoque.buscarLocalEstoque(onProgress);
    }

    async buscarTiposAjustes(onProgress) {
        return await this.estoque.buscarTiposAjustes(onProgress);
    }

    // Administração
    async buscarLojas(onProgress) {
        return await this.administracao.buscarLojas(onProgress);
    }

    // ========================================
    // MÉTODOS UTILITÁRIOS
    // ========================================

    /**
     * Buscar dados com paginação
     */
    async fetchPaginated(endpoint, start = 0, count = 500) {
        return await this.http.get(endpoint, { start, count, sort: 'id' });
    }

    /**
     * Buscar todos os dados (paginação automática)
     */
    async fetchAll(endpoint, onProgress = null) {
        return await this.produto.fetchAll(endpoint, onProgress);
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