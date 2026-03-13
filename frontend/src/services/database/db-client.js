// frontend/src/services/database/db-client.js
//
// ─── FASE 4 — SIMPLIFICAÇÃO (refactor/migrate-api-to-backend) ───────────────
//
// REMOVIDO nesta fase:
//   - save(endpoint, data)   — enviava lotes de dados ao backend
//   - _saveChunk()           — chamada HTTP POST /api/importacao/<rota>
//   - _resolveEndpoint()     — resolvia chave → rota via ENDPOINT_MAP
//   - _extractError()        — helper de erro HTTP
//   - import ENDPOINT_MAP    — mapeamento de rotas (arquivo removido na Fase 3)
//   - const BATCH_SIZE       — constante de lote
//
// MOTIVO:
//   Com o novo fluxo, o frontend NUNCA envia dados ao backend diretamente.
//   Toda a importação roda no backend via job executor.
//   O DatabaseClient agora é apenas um cliente de leitura de status.
//
// MANTIDO:
//   getStatistics() — contagem de registros por tabela (dashboard)
//   healthCheck()   — ping ao /health (indicador de status no topo da UI)
// ─────────────────────────────────────────────────────────────────────────────

import { API } from '../../config/constants.js';

export class DatabaseClient {

    constructor(baseURL = null) {
        this.baseURL = baseURL ?? `${API.PROXY_BASE}/api/importacao`;
    }

    /**
     * Retorna a contagem de registros de cada tabela no SQLite.
     * Chamado pela UI para atualizar o painel de estatísticas.
     *
     * @returns {Promise<Record<string, number>|null>}
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseURL}/estatisticas`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('[db-client] getStatistics:', error.message);
            return null;
        }
    }

    /**
     * Verifica se o backend está no ar.
     * Usado pelo indicador de conexão na UI.
     *
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
}

export default DatabaseClient;
