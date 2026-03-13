// frontend/src/app.js

/**
 * Aplicação Principal (Modularizada)
 * Ponto de entrada simplificado que orquestra os módulos
 */

import AppInitializer from './core/app-initializer.js';
import ConfigManager from './config/config-manager.js';
import EventHandlers from './ui/event-handlers.js';
import { ErrorHandlers } from './utils/error-handler.js';

// Inicializar aplicação
async function init() {
    try {
        ErrorHandlers();
        await AppInitializer.init();
    } catch (error) {
        console.error('❌ Falha crítica na inicialização:', error);
    }
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exports (para uso externo)
export { 
    init,
    AppInitializer,
    ConfigManager,
    EventHandlers
};