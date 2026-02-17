// frontend/src/app.js

/**
 * Aplicação Principal (Modularizada)
 * Ponto de entrada simplificado que orquestra os módulos
 */

import AppInitializer from './core/app-initializer.js';
import ConfigManager from './config/config-manager.js';
import EventHandlers from './ui/event-handlers.js';
import { ErrorHandlers } from './utils/error-handler.js';


/**
 * Inicializar aplicação
 */
async function init() {
    try {
        ErrorHandlers();
        await AppInitializer.init();
    } catch (error) {
        console.error('❌ Falha crítica na inicialização:', error);
    }
}

/**
 * Salvar configuração (mantido para compatibilidade)
 * @deprecated Use ConfigManager.salvar() diretamente
 */
async function salvarConfiguracao() {
    const dados = ConfigManager.obterDadosFormulario();
    if (!dados) return { success: false };
    
    return await ConfigManager.salvar(dados.apiUrl, dados.apiKey, dados.loja);
}

/**
 * Testar conexão (mantido para compatibilidade)
 * @deprecated Use ConfigManager.testar() diretamente
 */
async function testarConexao() {
    const dados = ConfigManager.obterDadosFormulario();
    if (!dados) return { success: false };
    
    return await ConfigManager.testar(dados.apiUrl, dados.apiKey, dados.loja);
}

/**
 * Toggle de senha (mantido para compatibilidade)
 * @deprecated Use EventHandlers.toggleSenha() diretamente
 */
function toggleSenha() {
    EventHandlers.toggleSenha();
}

// ====================================
// Auto-inicialização
// ====================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ====================================
// Exports (para uso externo)
// ====================================

export { 
    init, 
    salvarConfiguracao, 
    testarConexao, 
    toggleSenha,
    // Novos exports dos módulos
    AppInitializer,
    ConfigManager,
    EventHandlers
};

// ====================================
// API Global (opcional - para debug)
// ====================================

if (typeof window !== 'undefined') {
    window.__APP__ = {
        init,
        reinit: () => AppInitializer.reinit(),
        isReady: () => AppInitializer.isReady(),
        config: ConfigManager,
        events: EventHandlers,
        version: '2.0.0'
    };
}