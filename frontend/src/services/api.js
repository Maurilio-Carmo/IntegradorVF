// frontend/src/services/api.js

/**
 * Módulo de comunicação com a API Varejo Fácil (via proxy)
 */

import UI from "../ui/ui.js";

const API = {
    // URL do nosso backend proxy
    proxyURL: 'http://localhost:3000/api/vf',
    
    // Credenciais da API Varejo Fácil
    apiUrl: null,
    apiKey: null,
    loja: null,

    /**
     * Configurar API
     */
    configurar(apiUrl, apiKey, apiLoja) {
        // Remover /api/v1 da URL base se existir
        this.apiUrl = apiUrl
            .replace(/\/$/, '')
            .replace('/api/v1', '');
        
        this.apiKey = apiKey;
        this.loja = apiLoja;
        
        console.log('⚙️ API configurada:', this.apiUrl);
    },

    /**
     * Obter headers para requisições
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Headers customizados para o proxy
            'x-api-url': this.apiUrl + '/api/v1',
            'x-api-key': this.apiKey
        };
    },

    /**
     * Fazer requisição GET através do proxy
     */
    async get(endpoint, params = {}) {
        try {
            // Remover barra inicial do endpoint se existir
            const endpointPath = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            
            // Montar query string
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.proxyURL}/${endpointPath}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error('Erro na requisição GET:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error(
                    'Não foi possível conectar ao servidor proxy. ' +
                    'Verifique se o servidor está rodando.'
                );
            }
            
            throw error;
        }
    },

    /**
     * Testar conexão com a API
     */
    async testarConexao() {
        try {
            UI.log('🔍 Testando conexão com a API via proxy...', 'info');
            UI.log(`📍 URL destino: ${this.apiUrl}/api/v1`, 'info');
            
            const data = await this.get('administracao/licenciamento');
            
            if (data && data.razaoSocial) {
                UI.log(`✅ Conexão estabelecida! Empresa: ${data.razaoSocial}`, 'success');
                
                return {
                    success: true,
                    data
                };
            } else {
                throw new Error('Resposta da API não contém dados esperados');
            }
            
        } catch (error) {
            UI.log(`❌ Falha na conexão: ${error.message}`, 'error');
            
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Buscar dados com paginação
     */
    async fetchPaginated(endpoint, start = 0, count = 500) {
        return await this.get(endpoint, { start, count, sort: 'id' });
    },

    /**
     * Buscar todos os dados (paginação automática)
     */
    async fetchAll(endpoint, onProgress = null) {
        let start = 0;
        const pageSize = 500;
        let allData = [];
        let hasMore = true;

        while (hasMore) {
            const response = await this.fetchPaginated(endpoint, start, pageSize);
            const items = response.items || response.data || [];

            if (items.length === 0) {
                break;
            }

            allData = allData.concat(items);
            start += items.length;

            // Callback de progresso
            if (onProgress) {
                onProgress(allData.length, items.length);
            }

            // Se retornou menos que o tamanho da página, acabou
            if (items.length < pageSize) {
                hasMore = false;
            }

            // Pequena pausa para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return allData;
    },

    // ========================================
    // ENDPOINTS ESPECÍFICOS
    // ========================================

    async buscarSecoes(onProgress) {
        return await this.fetchAll('produto/secoes', onProgress);
    },

    async buscarGrupos(onProgress) {
        return await this.fetchAll('produto/grupos', onProgress);
    },

    async buscarSubgrupos(onProgress) {
        return await this.fetchAll('produto/subgrupos', onProgress);
    },

    async buscarMarcas(onProgress) {
        return await this.fetchAll('produto/marcas', onProgress);
    },

    async buscarProdutos(onProgress) {
        return await this.fetchAll('produto/produtos', onProgress);
    },

    async buscarClientes(onProgress) {
        return await this.fetchAll('pessoa/clientes', onProgress);
    },

    async buscarFornecedores(onProgress) {
        return await this.fetchAll('pessoa/fornecedores', onProgress);
    },

    async buscarCategorias(onProgress) {
        return await this.fetchAll('financeiro/categorias', onProgress);
    }
};

// Exportar para uso global
export default API;