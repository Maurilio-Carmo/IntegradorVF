// frontend/src/services/database/db-client.js

/**
 * DatabaseClient
 * Responsabilidade única: comunicar o frontend com o backend /api/importacao.
 *
 * Operações suportadas (espelham as rotas reais do backend):
 *   save()          → POST /api/importacao/<rota>
 *   getStatistics() → GET  /api/importacao/estatisticas
 *   healthCheck()   → GET  /health
 */

import { API } from '../../config/constants.js';
import { ENDPOINT_MAP } from './endpoint-map.js';

const BATCH_SIZE = 1000;

export class DatabaseClient {
    constructor(baseURL = null) {
        this.baseURL = baseURL ?? `${API.PROXY_BASE}/api/importacao`;
    }

    // PÚBLICO

    /**
     * Persiste um array de registros no backend.
     * Conjuntos grandes são enviados automaticamente em lotes de BATCH_SIZE.
     *
     * @param {string} endpoint
     * @param {Array}  data
     * @returns {Promise<{ salvos: number }>}
     */
    async save(endpoint, data) {
        if (!Array.isArray(data) || data.length <= BATCH_SIZE) {
            return this._saveChunk(endpoint, data);
        }

        console.log(`📦 [db-client] ${data.length} registros → lotes de ${BATCH_SIZE}`);

        let totalSalvos = 0;
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const chunk  = data.slice(i, i + BATCH_SIZE);
            const result = await this._saveChunk(endpoint, chunk);
            totalSalvos += result?.salvos ?? chunk.length;
            console.log(`   ✅ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} registros`);
        }

        return { salvos: totalSalvos };
    }

    /**
     * Retorna a contagem de registros de cada tabela no SQLite.
     * @returns {Promise<object|null>}
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseURL}/estatisticas`);
            if (!response.ok) throw new Error('Erro ao buscar estatísticas');
            return await response.json();
        } catch (error) {
            console.error('[db-client] getStatistics:', error.message);
            return null;
        }
    }

    /**
     * Verifica se o backend está no ar.
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        try {
            const url      = this.baseURL.replace('/api/importacao', '/health');
            const response = await fetch(url);
            return response.ok;
        } catch {
            return false;
        }
    }

    async _saveChunk(endpoint, data) {
        const rota = this._resolveEndpoint(endpoint);

        try {
            const response = await fetch(`${this.baseURL}/${rota}`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ data }),
            });

            if (!response.ok) {
                const err = await this._extractError(response);
                throw new Error(err.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error(`[db-client] save("${endpoint}") → /${rota}:`, error.message);
            throw error;
        }
    }

    /**
     * Resolve nome curto → rota real do backend.
     * Emite aviso se a chave não existir no mapa, mas não quebra.
     */
    _resolveEndpoint(endpoint) {
        const rota = ENDPOINT_MAP[endpoint];
        if (!rota) {
            console.warn(
                `[db-client] Endpoint "${endpoint}" não encontrado no ENDPOINT_MAP. ` +
                'Verifique se a chave foi adicionada em endpoint-map.js.'
            );
        }
        return rota ?? endpoint;
    }

    /**
     * Extrai a mensagem de erro de uma resposta HTTP.
     */
    async _extractError(response) {
        try   { return await response.json(); }
        catch { return { message: response.statusText }; }
    }
}

export default DatabaseClient;