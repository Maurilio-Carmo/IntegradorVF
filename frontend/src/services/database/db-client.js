// frontend/src/services/database/db-client.js

/**
 * Cliente de Banco de Dados
 * Gerencia comunicação com o backend para operações de banco de dados
 */

export class DatabaseClient {
    constructor(baseURL = 'http://localhost:3000/api/importacao') {
        this.baseURL = baseURL;
    }

    /**
     * Salvar dados no banco
     */
    async save(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });

            if (!response.ok) {
                const error = await this.extractError(response);
                throw new Error(error.message || `Erro ao salvar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao salvar ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Buscar estatísticas do banco
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseURL}/estatisticas`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar estatísticas');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return null;
        }
    }

    /**
     * Buscar dados do banco
     */
    async get(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}/${endpoint}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Deletar dados do banco
     */
    async delete(endpoint, id) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Erro ao deletar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao deletar ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Atualizar dados no banco
     */
    async update(endpoint, id, data) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao atualizar ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Limpar toda a tabela
     */
    async clear(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}/clear`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Erro ao limpar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao limpar ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Extrair mensagem de erro da resposta
     */
    async extractError(response) {
        try {
            return await response.json();
        } catch {
            return { message: response.statusText };
        }
    }

    /**
     * Verificar saúde do backend
     */
    async healthCheck() {
        try {
            const response = await fetch(this.baseURL.replace('/api/importacao', '/health'));
            return response.ok;
        } catch {
            return false;
        }
    }
}

export default DatabaseClient;