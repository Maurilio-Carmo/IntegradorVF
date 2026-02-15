// frontend/src/core/component-loader.js

/**
 * Component Loader
 * Sistema de carregamento dinâmico de componentes HTML
 */

const ComponentLoader = {
    /**
     * Mapeamento de componentes
     */
    components: {
        'header-component': 'components/header.html',
        'config-component': 'components/config.html',
        'stats-component': 'components/stats.html',
        'import-tabs-component': 'components/import-tabs.html',
        'log-component': 'components/log.html',
        'footer-component': 'components/footer.html'
    },

    /**
     * Carregar todos os componentes
     */
    async loadAll() {
        console.log('🔄 Carregando componentes...');
        
        const promises = Object.entries(this.components).map(([id, path]) => 
            this.loadComponent(id, path)
        );

        try {
            await Promise.all(promises);
            console.log('✅ Todos os componentes carregados!');
            
            // Disparar evento customizado
            document.dispatchEvent(new Event('componentsLoaded'));
        } catch (error) {
            console.error('❌ Erro ao carregar componentes:', error);
        }
    },

    /**
     * Carregar um componente específico
     */
    async loadComponent(elementId, filePath) {
        try {
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const element = document.getElementById(elementId);
            
            if (element) {
                element.innerHTML = html;
                console.log(`  ✅ ${elementId} carregado`);
            } else {
                console.warn(`  ⚠️  Elemento #${elementId} não encontrado`);
            }
        } catch (error) {
            console.error(`  ❌ Erro ao carregar ${elementId}:`, error);
            throw error;
        }
    },

    /**
     * Recarregar um componente específico
     */
    async reload(elementId) {
        const path = this.components[elementId];
        if (path) {
            await this.loadComponent(elementId, path);
        } else {
            console.warn(`Componente ${elementId} não encontrado no mapeamento`);
        }
    }
};

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ComponentLoader.loadAll();
    });
} else {
    ComponentLoader.loadAll();
}

// Exportar para uso global
export default ComponentLoader;