// frontend/src/utils/events.js

/**
 * Sistema de Eventos Customizados
 * Tipados, com helpers e desacoplamento total entre módulos.
 */

import { EVENTS as EVENT_NAMES } from '../config/constants.js';

// Core

export const Events = {

    // Emissão

    /**
     * Emitir evento customizado
     *   Events.emit('importCompleted', { entity: 'secoes', count: 5 })
     */
    emit(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles:    true,
            cancelable: true
        });
        document.dispatchEvent(event);
        console.debug(`📡 Evento emitido: ${eventName}`, detail);
        return event;
    },

    // Escuta

    /**
     * Ouvir evento (retorna função de cleanup)
     *   const off = Events.on('importCompleted', ({ detail }) => console.log(detail))
     *   off() // remove o listener
     */
    on(eventName, callback) {
        document.addEventListener(eventName, callback);
        return () => document.removeEventListener(eventName, callback);
    },

    /**
     * Ouvir uma única vez
     */
    once(eventName, callback) {
        document.addEventListener(eventName, callback, { once: true });
    },

    /**
     * Remover listener
     */
    off(eventName, callback) {
        document.removeEventListener(eventName, callback);
    },

    /**
     * Ouvir múltiplos eventos com o mesmo callback
     */
    onMany(eventNames, callback) {
        const offs = eventNames.map(name => this.on(name, callback));
        return () => offs.forEach(off => off());
    },

    // Aguardar

    /**
     * Aguardar um evento como Promise
     *   const { detail } = await Events.wait('componentsLoaded')
     */
    wait(eventName, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                document.removeEventListener(eventName, handler);
                reject(new Error(`Timeout aguardando evento "${eventName}"`));
            }, timeout);

            const handler = (e) => {
                clearTimeout(timer);
                resolve(e);
            };

            document.addEventListener(eventName, handler, { once: true });
        });
    },

    // Eventos tipados da aplicação

    app: {
        initialized(detail = {}) {
            Events.emit(EVENT_NAMES.APP_INITIALIZED, detail);
        },
        componentsLoaded(detail = {}) {
            Events.emit(EVENT_NAMES.COMPONENTS_LOADED, detail);
        }
    },

    config: {
        saved(config) {
            Events.emit(EVENT_NAMES.CONFIG_SAVED, { config });
        },
        loaded(config) {
            Events.emit(EVENT_NAMES.CONFIG_LOADED, { config });
        }
    },

    theme: {
        changed(theme) {
            Events.emit(EVENT_NAMES.THEME_CHANGED, { theme });
        }
    },

    import: {
        started(entity) {
            Events.emit(EVENT_NAMES.IMPORT_STARTED, { entity, timestamp: Date.now() });
        },
        progress(entity, current, total) {
            Events.emit(EVENT_NAMES.IMPORT_PROGRESS, { entity, current, total });
        },
        completed(entity, count) {
            Events.emit(EVENT_NAMES.IMPORT_COMPLETED, { entity, count, timestamp: Date.now() });
        },
        failed(entity, error) {
            Events.emit(EVENT_NAMES.IMPORT_FAILED, {
                entity,
                error: error?.message || String(error),
                timestamp: Date.now()
            });
        }
    },

    stats: {
        updated(stats) {
            Events.emit(EVENT_NAMES.STATS_UPDATED, { stats });
        }
    },

    sync: {
        started(entities) {
            Events.emit(EVENT_NAMES.SYNC_STARTED, { entities, timestamp: Date.now() });
        },
        completed(result) {
            Events.emit(EVENT_NAMES.SYNC_COMPLETED, { result, timestamp: Date.now() });
        },
        failed(error) {
            Events.emit(EVENT_NAMES.SYNC_FAILED, {
                error: error?.message || String(error),
                timestamp: Date.now()
            });
        }
    }
};

export default Events;