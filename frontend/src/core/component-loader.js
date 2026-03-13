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
        'header-component':      'components/header.html',
        'config-component':      'components/config.html',
        'stats-component':       'components/stats.html',
        'import-tabs-component': 'components/import-tabs.html',
        'log-component':         'components/log.html',
        'footer-component':      'components/footer.html'
    },

    /**
     * Cache de HTML já buscado.
     * Evita novo fetch ao recarregar um componente na mesma sessão.
     * @type {Map<string, string>}
     */
    _cache: new Map(),

    //  API pública

    async loadAll() {
        console.log('🔄 Carregando componentes...');

        this._setPlaceholderOpacity(0);

        const promises = Object.entries(this.components).map(
            ([id, path]) => this._loadComponent(id, path)
        );

        try {
            await Promise.all(promises);
            console.log('✅ Todos os componentes carregados!');

            this._setPlaceholderOpacity(1);

            document.dispatchEvent(new CustomEvent('componentsLoaded'));
        } catch (error) {
            console.error('❌ Erro ao carregar componentes:', error);

            this._setPlaceholderOpacity(1);
        }
    },

    /**
     * Recarrega um componente específico.
     * @param {string} elementId - ID do elemento alvo
     */
    async reload(elementId) {
        const path = this.components[elementId];
        if (!path) {
            console.warn(`Componente "${elementId}" não existe no mapeamento.`);
            return;
        }
        // Invalida cache para forçar novo fetch
        this._cache.delete(path);
        await this._loadComponent(elementId, path);
    },

    //  Métodos privados

    /**
     * Busca e injeta HTML de um componente.
     * Usa cache em memória para evitar requests duplicados.
     *
     * @param {string} elementId - ID do elemento alvo no DOM
     * @param {string} filePath  - Caminho relativo do arquivo HTML
     */
    async _loadComponent(elementId, filePath) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`  ⚠️  Elemento #${elementId} não encontrado no DOM.`);
            return;
        }

        try {
            let html = this._cache.get(filePath);

            if (!html) {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ao carregar ${filePath}`);
                }
                html = await response.text();
                this._cache.set(filePath, html);
            }

            element.innerHTML = html;
            console.log(`  ✅ ${elementId} carregado`);

        } catch (error) {
            console.error(`  ❌ Erro ao carregar ${elementId}:`, error);
            element.innerHTML = `
                <div style="padding:8px;color:#ef4444;font-size:12px;">
                    Falha ao carregar componente (${elementId})
                </div>`;
            throw error;
        }
    },

    /**
     * Aplica opacity em todos os placeholders mapeados.
     * Usa transition CSS para um reveal suave sem CLS.
     *
     * @param {number} value - 0 (invisível) ou 1 (visível)
     */
    _setPlaceholderOpacity(value) {
        Object.keys(this.components).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            if (value === 0) {
                // Oculta SEM afetar o layout (espaço é mantido)
                el.style.opacity = '0';
                el.style.transition = 'none';
            } else {
                // Revela com fade-in suave (150ms)
                el.style.transition = 'opacity 0.15s ease';
                el.style.opacity = '1';
            }
        });
    }
};

//  Auto-inicialização

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ComponentLoader.loadAll());
} else {
    ComponentLoader.loadAll();
}

export default ComponentLoader;