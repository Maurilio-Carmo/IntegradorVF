// frontend/src/services/database/db-client.js

/**
 * Cliente de Banco de Dados
 * Gerencia comunicação com o backend para operações de banco de dados.
 */

/** Mapeia nomes curtos (usados pelos importers) → rota real do backend */
const ENDPOINT_MAP = {
    // ── Produto ────────────────────────────────────────────────────────────
    'familias':               'importar-familias',
    'marcas':                 'importar-marcas',
    'produtos':               'importar-produtos',
    'mercadologia':           'importar-mercadologia',

    // ── Financeiro ─────────────────────────────────────────────────────────
    'categorias':             'importar-categorias',
    'agentes-financeiros':    'importar-agentes',
    'agentes':                'importar-agentes',
    'contas-correntes':       'importar-contas-correntes',
    'especies-documentos':    'importar-especies-documento',
    'especies-documento':     'importar-especies-documento',
    'historicos-padrao':      'importar-historico-padrao',
    'historico-padrao':       'importar-historico-padrao',

    // ── PDV / Frente de Loja ───────────────────────────────────────────────
    'importar-pagamentos-pdv':       'importar-pagamentos-pdv',
    'importar-recebimentos-pdv':     'importar-recebimentos-pdv',
    'importar-motivos-desconto':     'importar-motivos-desconto',
    'importar-motivos-devolucao':    'importar-motivos-devolucao',
    'importar-motivos-cancelamento': 'importar-motivos-cancelamento',

    // ── Estoque ────────────────────────────────────────────────────────────
    'local-estoque':         'importar-local-estoque',
    'tipos-ajustes':          'importar-tipos-ajustes',

    // ── Fiscal ─────────────────────────────────────────────────────────────
    'regime-tributario':            'importar-regime-tributario',
    'regime-estadual-tributario':   'importar-regime-tributario',
    'situacoes-fiscais':            'importar-situacoes-fiscais',
    'situacoes':                    'importar-situacoes-fiscais',
    'tipos-operacoes':              'importar-tipos-operacoes',
    'operacoes':                    'importar-tipos-operacoes',
    'impostos-federais':            'importar-impostos-federais',
    'tabelas-tributarias':          'importar-tabelas-tributarias',

    // ── Pessoa ─────────────────────────────────────────────────────────────
    'lojas':                  'importar-lojas',
    'clientes':               'importar-clientes',
    'fornecedores':           'importar-fornecedores',
};

export class DatabaseClient {
    constructor(baseURL = 'http://localhost:3000/api/importacao') {
        this.baseURL = baseURL;
    }

    /**
     * Resolve o endpoint real a partir do nome curto.
     * Se não houver mapeamento, usa o nome original (compatibilidade).
     * @param {string} endpoint
     * @returns {string}
     */
    _resolveEndpoint(endpoint) {
        const resolved = ENDPOINT_MAP[endpoint];
        if (!resolved) {
            console.warn(
                `[db-client] Endpoint "${endpoint}" não encontrado no ENDPOINT_MAP. ` +
                'Usando o nome original — verifique se a rota existe no backend.'
            );
        }
        return resolved ?? endpoint;
    }

    /**
     * Salvar dados no banco
     * @param {string} endpoint  - Nome curto (ex: 'familias') ou rota completa
     * @param {Array}  data      - Array de registros
     * @param {Object} [extra]   - Campos extras enviados junto ao body (ex: { lojaId })
     */
    async save(endpoint, data) {
        // Produtos podem ter milhares de registros — envia em lotes de 200
        const BATCH_SIZE = 1000;

        if (!Array.isArray(data) || data.length <= BATCH_SIZE) {
            return this._saveChunk(endpoint, data);
        }

        console.log(`📦 [db-client] Enviando ${data.length} registros em lotes de ${BATCH_SIZE}...`);

        let totalSalvos = 0;
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const chunk = data.slice(i, i + BATCH_SIZE);
            const result = await this._saveChunk(endpoint, chunk);
            totalSalvos += result?.salvos ?? chunk.length;
            console.log(`   ✅ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} registros`);
        }

        return { salvos: totalSalvos };
    }

    async _saveChunk(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });

            if (!response.ok) {
                const error = await this.extractError(response);
                throw new Error(error.message || `Erro ao salvar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao salvar "${endpoint}" → /${endpoint}:`, error);
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
        const rota = this._resolveEndpoint(endpoint);
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}/${rota}${queryString ? '?' + queryString : ''}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro ao buscar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar "${endpoint}":`, error);
            throw error;
        }
    }

    /**
     * Deletar dados do banco
     */
    async delete(endpoint, id) {
        const rota = this._resolveEndpoint(endpoint);
        try {
            const response = await fetch(`${this.baseURL}/${rota}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Erro ao deletar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao deletar "${endpoint}/${id}":`, error);
            throw error;
        }
    }

    /**
     * Atualizar dados no banco
     */
    async update(endpoint, id, data) {
        const rota = this._resolveEndpoint(endpoint);
        try {
            const response = await fetch(`${this.baseURL}/${rota}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao atualizar "${endpoint}/${id}":`, error);
            throw error;
        }
    }

    /**
     * Limpar toda a tabela
     */
    async clear(endpoint) {
        const rota = this._resolveEndpoint(endpoint);
        try {
            const response = await fetch(`${this.baseURL}/${rota}/clear`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Erro ao limpar: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao limpar "${endpoint}":`, error);
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
            const response = await fetch(
                this.baseURL.replace('/api/importacao', '/health')
            );
            return response.ok;
        } catch {
            return false;
        }
    }
}

export default DatabaseClient;