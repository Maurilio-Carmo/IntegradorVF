// frontend/src/services/state-manager.js

/**
 * Gerenciador de Estado Global
 * Estado reativo e centralizado — sem dependência de framework.
 * Subscribers são notificados sempre que uma chave muda.
 */

import { STORAGE_KEYS, THEMES, TABS } from '../config/constants.js';

class StateManager {

    constructor(initialState = {}) {
        // Estado padrão da aplicação
        this._state = {
            // Configuração
            config:           null,          // { apiUrl, apiKey, loja }
            isConfigured:     false,

            // Tema
            theme:            THEMES.LIGHT,

            // Conexão
            isConnected:      false,

            // Navegação
            currentTab:       TABS.PRODUTO,

            // Importação
            importInProgress: false,
            lastImport:       null,          // { entity, count, timestamp }

            // Estatísticas
            stats:            {},

            // Logs
            logCount:         0,

            // Spread de estado externo (para extensão)
            ...initialState
        };

        this._subscribers = {};   // { key: [callback, ...] }
        this._globalSubs  = [];   // chamados em qualquer mudança
    }

    // Leitura

    /**
     * Ler o valor de uma chave
     */
    get(key) {
        return this._state[key];
    }

    /**
     * Cópia do estado completo (imutável)
     */
    getAll() {
        return { ...this._state };
    }

    // Escrita

    /**
     * Atualizar uma ou mais chaves
     *   State.set('theme', 'dark')
     *   State.set({ isConnected: true, currentTab: 'produto' })
     */
    set(keyOrObject, value) {
        if (typeof keyOrObject === 'object') {
            Object.entries(keyOrObject).forEach(([k, v]) => this._update(k, v));
        } else {
            this._update(keyOrObject, value);
        }
        return this;
    }

    /**
     * Atualizar campo aninhado dentro de um objeto
     *   State.patch('stats', { secoes: 5 })
     */
    patch(key, partialValue) {
        const current = this._state[key];
        if (current && typeof current === 'object') {
            this._update(key, { ...current, ...partialValue });
        } else {
            this._update(key, partialValue);
        }
        return this;
    }

    /**
     * Resetar chave para o valor inicial
     */
    reset(key) {
        const defaults = {
            importInProgress: false,
            isConnected:      false,
            lastImport:       null,
            logCount:         0,
            stats:            {}
        };
        if (key in defaults) {
            this._update(key, defaults[key]);
        }
        return this;
    }

    // Subscriptions

    /**
     * Ouvir mudanças em uma chave específica
     *   const unsub = State.watch('theme', (newVal, oldVal) => { ... })
     *   unsub() // para de ouvir
     */
    watch(key, callback) {
        if (!this._subscribers[key]) this._subscribers[key] = [];
        this._subscribers[key].push(callback);

        // Retornar função de cancelamento
        return () => {
            this._subscribers[key] = this._subscribers[key].filter(cb => cb !== callback);
        };
    }

    /**
     * Ouvir qualquer mudança de estado
     *   const unsub = State.onChange((key, newVal, oldVal) => { ... })
     */
    onChange(callback) {
        this._globalSubs.push(callback);
        return () => {
            this._globalSubs = this._globalSubs.filter(cb => cb !== callback);
        };
    }

    /**
     * Ouvir apenas uma vez
     */
    once(key, callback) {
        const unsub = this.watch(key, (newVal, oldVal) => {
            callback(newVal, oldVal);
            unsub();
        });
        return unsub;
    }

    // Persistência

    /**
     * Salvar uma chave no localStorage
     */
    persist(key) {
        try {
            localStorage.setItem(
                `state_${key}`,
                JSON.stringify(this._state[key])
            );
        } catch (e) {
            console.warn(`⚠️ StateManager: não foi possível persistir "${key}"`, e);
        }
    }

    /**
     * Restaurar uma chave do localStorage
     */
    restore(key) {
        try {
            const raw = localStorage.getItem(`state_${key}`);
            if (raw !== null) {
                this._update(key, JSON.parse(raw));
            }
        } catch (e) {
            console.warn(`⚠️ StateManager: não foi possível restaurar "${key}"`, e);
        }
    }

    // Debug

    /**
     * Logar estado atual no console (dev only)
     */
    debug() {
        console.group('🗂️ Estado Atual');
        Object.entries(this._state).forEach(([k, v]) => {
            console.log(`  ${k}:`, v);
        });
        console.groupEnd();
    }

    // Privado

    _update(key, newValue) {
        const oldValue = this._state[key];

        // Ignorar se não mudou (comparação simples)
        if (oldValue === newValue) return;

        this._state[key] = newValue;

        // Notificar subscribers específicos
        (this._subscribers[key] || []).forEach(cb => {
            try { cb(newValue, oldValue); }
            catch (e) { console.error(`StateManager subscriber error [${key}]:`, e); }
        });

        // Notificar subscribers globais
        this._globalSubs.forEach(cb => {
            try { cb(key, newValue, oldValue); }
            catch (e) { console.error('StateManager global subscriber error:', e); }
        });
    }
}

// Singleton

const State = new StateManager();

// Restaurar tema e config na inicialização
State.restore('theme');
State.restore('config');
if (State.get('config')) {
    State.set('isConfigured', true);
}

// Persistir automaticamente quando mudar
State.watch('theme',  () => State.persist('theme'));
State.watch('config', () => State.persist('config'));

export { State, StateManager };
export default State;