/**
 * theme-manager.js
 * Gerenciador de tema claro/escuro
 */

const ThemeManager = {
    // Chave do localStorage
    STORAGE_KEY: 'app_theme',
    
    // Tema atual
    currentTheme: 'light',

    /**
     * Inicializar tema
     */
    init() {
        console.log('🎨 Inicializando Theme Manager...');
        
        // Carregar tema salvo ou detectar preferência do sistema
        this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
        
        // Aplicar tema
        this.applyTheme(this.currentTheme);
        
        // Configurar listener de mudança de tema do sistema
        this.watchSystemTheme();
        
        console.log(`✅ Tema aplicado: ${this.currentTheme}`);
    },

    /**
     * Obter tema salvo no localStorage
     */
    getSavedTheme() {
        return localStorage.getItem(this.STORAGE_KEY);
    },

    /**
     * Obter preferência de tema do sistema
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    /**
     * Aplicar tema
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        
        // Aplicar no HTML
        document.documentElement.setAttribute('data-theme', theme);
        
        // Salvar preferência
        localStorage.setItem(this.STORAGE_KEY, theme);
        
        // Atualizar botões (se existirem)
        this.updateButtons();
        
        // Disparar evento customizado
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    },

    /**
     * Alternar tema
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        console.log(`🔄 Tema alternado para: ${newTheme}`);
    },

    /**
     * Definir tema específico
     */
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
        } else {
            console.warn(`⚠️ Tema inválido: ${theme}`);
        }
    },

    /**
     * Atualizar visual dos botões
     */
    updateButtons() {
        // Atualizar botões de tema (se existirem)
        const lightBtn = document.querySelector('[data-theme-option="light"]');
        const darkBtn = document.querySelector('[data-theme-option="dark"]');
        
        if (lightBtn && darkBtn) {
            lightBtn.classList.toggle('active', this.currentTheme === 'light');
            darkBtn.classList.toggle('active', this.currentTheme === 'dark');
        }
    },

    /**
     * Observar mudanças de tema do sistema
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // Só aplicar se usuário não tiver preferência salva
                if (!this.getSavedTheme()) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(newTheme);
                    console.log(`🔄 Tema do sistema mudou para: ${newTheme}`);
                }
            });
        }
    },

    /**
     * Criar botão de alternância
     */
    createSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <div class="theme-option theme-icon-light" data-theme-option="light" title="Tema Claro"></div>
            <div class="theme-option theme-icon-dark" data-theme-option="dark" title="Tema Escuro"></div>
        `;
        
        // Adicionar eventos
        switcher.querySelector('[data-theme-option="light"]').addEventListener('click', () => {
            this.setTheme('light');
        });
        
        switcher.querySelector('[data-theme-option="dark"]').addEventListener('click', () => {
            this.setTheme('dark');
        });
        
        // Atualizar estado inicial
        this.updateButtons();
        
        return switcher;
    },

    /**
     * Adicionar switcher no header
     */
    addToHeader() {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const switcher = this.createSwitcher();
            // Adicionar antes do botão de config
            const configBtn = document.getElementById('btnConfig');
            if (configBtn) {
                headerActions.insertBefore(switcher, configBtn);
            } else {
                headerActions.appendChild(switcher);
            }
            console.log('✅ Theme switcher adicionado ao header');
        }
    }
};

// Auto-inicializar quando componentes carregarem
document.addEventListener('componentsLoaded', () => {
    ThemeManager.init();
    ThemeManager.addToHeader();
});

// Fallback: inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
    });
} else {
    ThemeManager.init();
}

// Exportar para uso global
export default ThemeManager;