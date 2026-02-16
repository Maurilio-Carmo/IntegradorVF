// frontend/src/services/api/api-base.js

/**
 * Classe Base para APIs
 * Fornece métodos comuns para todos os endpoints da API Varejo Fácil
 */

import HttpClient from './http-client.js';
import UI from '../../ui/ui.js';

export class APIBase {
    constructor(baseURL) {
        this.http = new HttpClient(baseURL);
        this.apiUrl = null;
        this.apiKey = null;
        this.loja = null;
    }

    /**
     * Configurar credenciais
     */
    configure(apiUrl, apiKey, loja) {
        this.apiUrl = apiUrl
            .replace(/\/$/, '')
            .replace('/api/v1', '');
        
        this.apiKey = apiKey;
        this.loja = loja;

        // Atualizar headers do HttpClient
        this.http.setHeaders({
            'x-api-url': this.apiUrl + '/api/v1',
            'x-api-key': this.apiKey
        });

        console.log('⚙️ API configurada:', this.apiUrl);
    }

    /**
     * Verificar se está configurado
     */
    isConfigured() {
        return this.apiUrl && this.apiKey && this.loja;
    }

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
        const pageSize = 500;
        let start = 0;
        let allData = [];
        let hasMore = true;

        while (hasMore) {
            const response = await this.fetchPaginated(endpoint, start, pageSize);
            const items = response.items || response.data || [];

            if (items.length === 0) break;

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
            await this.delay(100);
        }

        return allData;
    }

    /**
     * Testar conexão com a API
     */
    async testConnection() {
        try {
            UI.log('🔍 Testando conexão com a API...', 'info');
            UI.log(`📍 URL destino: ${this.apiUrl}/api/v1`, 'info');
            
            const data = await this.http.get('administracao/licenciamento');
            
            if (data && data.razaoSocial) {
                UI.log(`✅ Conexão estabelecida! Empresa: ${data.razaoSocial}`, 'success');
                
                return {
                    success: true,
                    data
                };
            }
            
            throw new Error('Resposta da API não contém dados esperados');
            
        } catch (error) {
            UI.log(`❌ Falha na conexão: ${error.message}`, 'error');
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delay assíncrono
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Método genérico para buscar recursos
     */
    async fetch(resource, options = {}) {
        const { 
            onProgress = null,
            pageSize = 500,
            params = {}
        } = options;

        if (onProgress) {
            return await this.fetchAll(resource, onProgress);
        }

        return await this.http.get(resource, params);
    }
}

export default APIBase;