// frontend/src/features/import/job-client.js

/**
 * JobClient — Cliente de Jobs de Importação (Backend-Driven)
 * 
 * Correção: tratamento defensivo de respostas não-JSON.
 * Quando o backend retorna HTML (ex: SPA fallback por 404), o código
 * agora detecta isso e lança um erro claro em vez de "Unexpected token <".
 */

const BASE_URL = '/api/import-job';

/** @type {Map<string, EventSource>} */
const _activeSources = new Map();

/** @type {Map<string, Set<Function>>} */
const _listeners = new Map();

// ─── Helper: fetch JSON com detecção de HTML ──────────────────────────────────

/**
 * Faz fetch e garante que a resposta é JSON.
 * Se o servidor devolver HTML (ex: index.html por SPA fallback),
 * lança um erro legível em vez de "Unexpected token <".
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function _fetchJSON(url, options = {}) {
    const res = await fetch(url, options);

    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
        if (isJson) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message ?? `HTTP ${res.status} ${res.statusText}`);
        }
        // HTML de erro (404/500 sem JSON)
        throw new Error(
            `HTTP ${res.status} ${res.statusText} — ` +
            `o servidor retornou HTML em vez de JSON. ` +
            `Verifique se o endpoint existe: ${options.method ?? 'GET'} ${url}`
        );
    }

    if (!isJson) {
        // Status 200 mas retornou HTML (SPA fallback capturando 404)
        throw new Error(
            `O servidor retornou HTML em vez de JSON para ${url}. ` +
            `Isso geralmente indica que o endpoint não existe no backend. ` +
            `Confirme se "POST /api/import-job/start" foi adicionado ao ImportJobController.`
        );
    }

    return res.json();
}

// ─── API Pública ──────────────────────────────────────────────────────────────

const JobClient = {

    /**
     * Inicia um novo job de importação no backend.
     * @param {string} dominio
     * @returns {Promise<string>} jobId
     */
    async start(dominio) {
        const data = await _fetchJSON(`${BASE_URL}/start`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ dominio }),
        });

        const jobId = data.jobId;
        if (!jobId) throw new Error('Backend não retornou jobId');

        this._connect(jobId);
        return jobId;
    },

    /**
     * Verifica jobs ativos e reconecta automaticamente.
     * @returns {Promise<ImportJob[]>}
     */
    async reconnectIfActive() {
        try {
            const data = await _fetchJSON(`${BASE_URL}/active`);
            const jobs = Array.isArray(data) ? data : [];

            for (const job of jobs) {
                if (!_activeSources.has(job.id)) {
                    console.log(`🔄 Reconectando ao job: ${job.id} (${job.label})`);
                    this._connect(job.id);
                }
            }

            return jobs;
        } catch (err) {
            console.warn('⚠️ Não foi possível verificar jobs ativos:', err.message);
            return [];
        }
    },

    /**
     * Obtém snapshot atual de um job sem abrir SSE.
     * @param {string} jobId
     * @returns {Promise<ImportJob|null>}
     */
    async getSnapshot(jobId) {
        try {
            return await _fetchJSON(`${BASE_URL}/${jobId}`);
        } catch {
            return null;
        }
    },

    /**
     * Cancela um job em andamento.
     * @param {string} jobId
     * @returns {Promise<boolean>}
     */
    async cancel(jobId) {
        try {
            await fetch(`${BASE_URL}/${jobId}`, { method: 'DELETE' });
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Registra callback para eventos de um job.
     * @param {string}   jobId
     * @param {Function} callback  fn(eventName, data)
     * @returns {Function} unsubscribe
     */
    subscribe(jobId, callback) {
        if (!_listeners.has(jobId)) _listeners.set(jobId, new Set());
        _listeners.get(jobId).add(callback);
        return () => _listeners.get(jobId)?.delete(callback);
    },

    /**
     * Fecha conexão SSE e remove listeners de um job.
     * @param {string} jobId
     */
    disconnect(jobId) {
        const source = _activeSources.get(jobId);
        if (source) {
            source.close();
            _activeSources.delete(jobId);
        }
        _listeners.delete(jobId);
    },

    // ─── Privado ──────────────────────────────────────────────────────────────

    _connect(jobId) {
        if (_activeSources.has(jobId)) return;

        const source = new EventSource(`${BASE_URL}/${jobId}/events`);
        _activeSources.set(jobId, source);

        source.addEventListener('job:snapshot',   (e) => this._emit(jobId, 'job:snapshot',   JSON.parse(e.data)));
        source.addEventListener('job:started',    (e) => this._emit(jobId, 'job:started',    JSON.parse(e.data)));
        source.addEventListener('step:progress',  (e) => this._emit(jobId, 'step:progress',  JSON.parse(e.data)));
        source.addEventListener('step:completed', (e) => this._emit(jobId, 'step:completed', JSON.parse(e.data)));
        source.addEventListener('step:error',     (e) => this._emit(jobId, 'step:error',     JSON.parse(e.data)));

        source.addEventListener('job:completed', (e) => {
            this._emit(jobId, 'job:completed', JSON.parse(e.data));
            setTimeout(() => this.disconnect(jobId), 2000);
        });

        source.addEventListener('job:error', (e) => {
            this._emit(jobId, 'job:error', JSON.parse(e.data));
            setTimeout(() => this.disconnect(jobId), 2000);
        });

        source.addEventListener('job:cancelled', (e) => {
            this._emit(jobId, 'job:cancelled', JSON.parse(e.data));
            this.disconnect(jobId);
        });

        source.onerror = () => {
            console.warn(`⚠️ SSE: conexão perdida com job ${jobId}. Reconectando automaticamente...`);
        };

        console.log(`📡 SSE conectado ao job: ${jobId}`);
    },

    _emit(jobId, event, data) {
        _listeners.get(jobId)?.forEach(fn => {
            try { fn(event, data); }
            catch (err) { console.error(`❌ Listener job ${jobId}:`, err); }
        });
    },
};

export default JobClient;