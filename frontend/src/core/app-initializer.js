// frontend/src/core/app-initializer.js

/**
 * Inicializador da Aplicação
 * Gerencia o processo de inicialização e setup da aplicação
 */

import ThemeManager from './theme-manager.js';
import ComponentLoader from './component-loader.js';
import ConfigManager from '../config/config-manager.js';
import EventHandlers from '../ui/event-handlers.js';
import Importacao from '../features/import/index.js';
import Tabs from '../ui/tabs/tabs-manager.js';
import UI from '../ui/ui.js';

export const AppInitializer = {
    /**
     * Estado de inicialização
     */
    isInitialized: false,
    initPromise: null,

    /**
     * Inicializar aplicação
     */
    async init() {
        if (this.isInitialized) {
            console.warn('⚠️ Aplicação já foi inicializada');
            return this.initPromise;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        console.log('🚀 Iniciando aplicação...');

        this.initPromise = this._initSequence();
        await this.initPromise;

        this.isInitialized = true;
        return this.initPromise;
    },

    /**
     * Sequência de inicialização
     */
    async _initSequence() {
        try {
            // 1. Aguardar componentes HTML carregarem
            await this.waitForComponents();
            console.log('✅ Componentes carregados');

            // 2. Inicializar tema
            await this.initTheme();
            console.log('✅ Tema inicializado');

            // 3. Carregar configuração salva
            await this.initConfig();
            console.log('✅ Configuração inicializada');

            // 4. Configurar event listeners
            await this.initEventHandlers();
            console.log('✅ Event handlers configurados');

            // 5. Inicializar sistema de tabs
            await this.initTabs();
            console.log('✅ Tabs inicializadas');

            // 6. Carregar estatísticas do banco
            await this.initStatistics();
            console.log('✅ Estatísticas carregadas');

            // 7. Finalização
            this.onInitComplete();

            console.log('✅ Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.onInitError(error);
            throw error;
        }
    },

    /**
     * Aguardar carregamento dos componentes HTML
     */
    async waitForComponents() {
        return new Promise((resolve) => {
            const check = () => {
                const headerLoaded = document.querySelector('#header-component')?.children.length > 0;
                return headerLoaded;
            };

            if (check()) {
                console.log('✅ Componentes já carregados');
                resolve();
                return;
            }

            console.log('⏳ Aguardando componentes...');

            // Timeout de segurança (5 segundos)
            const timeout = setTimeout(() => {
                console.warn('⚠️ Timeout aguardando componentes. Continuando...');
                resolve();
            }, 5000);

            document.addEventListener('componentsLoaded', () => {
                console.log('✅ Evento componentsLoaded recebido');
                clearTimeout(timeout);
                resolve();
            }, { once: true });
        });
    },

    /**
     * Inicializar tema
     */
    async initTheme() {
        return new Promise((resolve) => {
            ThemeManager.init();
            resolve();
        });
    },

    /**
     * Inicializar configuração
     */
    async initConfig() {
        try {
            await ConfigManager.carregar();
        } catch (error) {
            console.error('⚠️ Erro ao carregar configuração:', error);
        }
    },

    /**
     * Inicializar event handlers
     */
    async initEventHandlers() {
        return new Promise((resolve) => {
            EventHandlers.setup();
            resolve();
        });
    },

    /**
     * Inicializar sistema de tabs
     */
    async initTabs() {
        return new Promise((resolve) => {
            Tabs.init();
            resolve();
        });
    },

    /**
     * Inicializar estatísticas
     */
    async initStatistics() {
        try {
            await Importacao.atualizarEstatisticas();
        } catch (error) {
            console.error('⚠️ Erro ao carregar estatísticas:', error);
            UI.log('⚠️ Não foi possível carregar estatísticas do banco', 'warning');
        }
    },

    /**
     * Callback quando inicialização completa
     */
    onInitComplete() {
        UI.log('🎯 Sistema pronto para uso!', 'success');
        
        // Disparar evento customizado
        document.dispatchEvent(new CustomEvent('appInitialized', {
            detail: { timestamp: new Date() }
        }));
    },

    /**
     * Callback quando erro na inicialização
     */
    onInitError(error) {
        UI.log(`❌ Erro na inicialização: ${error.message}`, 'error');
        UI.mostrarAlerta('❌ Erro ao inicializar aplicação. Verifique o console.', 'error');
    },

    /**
     * Reinicializar aplicação
     */
    async reinit() {
        console.log('🔄 Reinicializando aplicação...');
        
        this.isInitialized = false;
        this.initPromise = null;
        
        // Limpar event handlers
        EventHandlers.cleanup();
        
        // Reinicializar
        await this.init();
    },

    /**
     * Verificar se está inicializado
     */
    isReady() {
        return this.isInitialized;
    }
};

export default AppInitializer;