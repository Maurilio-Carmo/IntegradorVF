// frontend/src/features/import/job-client.js

const BASE_URL = '/api/import-job';

const _activeSources = new Map(); // jobId → EventSource
const _listeners     = new Map(); // jobId → Set<Function>

async function _fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
        if (isJson) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message ?? `HTTP ${res.status} ${res.statusText}`);
        }
        throw new Error(
            `HTTP ${res.status} ${res.statusText} — servidor retornou HTML. ` +
            `Verifique o endpoint: ${options.method ?? 'GET'} ${url}`
        );
    }
    if (!isJson) {
        throw new Error(
            `Servidor retornou HTML para ${url}. ` +
            `Confirme se POST /api/import-job/start existe no backend.`
        );
    }
    return res.json();
}

const JobClient = {

    /**
     * Inicia um job no backend.
     * @param {string}           dominio  — 'produto' | 'financeiro' | 'frenteLoja' | 'estoque' | 'fiscal' | 'pessoa'
     * @param {string|undefined} step     — nome da etapa individual (ex: 'marcas').
     *                                      Se omitido → roda o domínio completo.
     * @returns {Promise<string>} jobId
     */
    async start(dominio, step = undefined) {
        const body = { dominio };
        if (step) body.step = step;

        const data = await _fetchJSON(`${BASE_URL}/start`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body),
        });

        if (!data.jobId) throw new Error('Backend não retornou jobId');
        this._connect(data.jobId);
        return data.jobId;
    },

    async reconnectIfActive() {
        try {
            const jobs = await _fetchJSON(`${BASE_URL}/active`);
            const list = Array.isArray(jobs) ? jobs : [];
            for (const job of list) {
                if (!_activeSources.has(job.id)) this._connect(job.id);
            }
            return list;
        } catch (err) {
            console.warn('⚠️ Jobs ativos não verificados:', err.message);
            return [];
        }
    },

    async getSnapshot(jobId) {
        try { return await _fetchJSON(`${BASE_URL}/${jobId}`); }
        catch { return null; }
    },

    async cancel(jobId) {
        try { await fetch(`${BASE_URL}/${jobId}`, { method: 'DELETE' }); return true; }
        catch { return false; }
    },

    subscribe(jobId, callback) {
        if (!_listeners.has(jobId)) _listeners.set(jobId, new Set());
        _listeners.get(jobId).add(callback);
        return () => _listeners.get(jobId)?.delete(callback);
    },

    disconnect(jobId) {
        _activeSources.get(jobId)?.close();
        _activeSources.delete(jobId);
        _listeners.delete(jobId);
    },

    _connect(jobId) {
        if (_activeSources.has(jobId)) return;
        const source = new EventSource(`${BASE_URL}/${jobId}/events`);
        _activeSources.set(jobId, source);

        ['job:snapshot','job:started','step:progress','step:completed','step:error'].forEach(ev => {
            source.addEventListener(ev, (e) => this._emit(jobId, ev, JSON.parse(e.data)));
        });
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
        source.onerror = () => console.warn(`⚠️ SSE perdida: job ${jobId}`);
        console.log(`📡 SSE conectado: ${jobId}`);
    },

    _emit(jobId, event, data) {
        _listeners.get(jobId)?.forEach(fn => {
            try { fn(event, data); } catch (err) { console.error(`❌ Listener ${jobId}:`, err); }
        });
    },
};

export default JobClient;