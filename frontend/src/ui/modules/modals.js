// frontend/src/ui/modules/modals.js

/**
 * Gerenciador de Modais
 */

export const Modals = {
    /**
     * Mostrar modal de configuração
     */
    showConfig() {
        const section = document.getElementById('sectionConfig');
        const dashboard = document.getElementById('dashboard-section');
        
        if (section) section.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    },

    /**
     * Fechar modal de configuração
     */
    closeConfig() {
        const section = document.getElementById('sectionConfig');
        const dashboard = document.getElementById('dashboard-section');
        
        if (section) section.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
    },

    /**
     * Toggle modal
     */
    toggle(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const isVisible = modal.style.display !== 'none';
        modal.style.display = isVisible ? 'none' : 'block';
    },

    /**
     * Mostrar confirmação
     */
    confirm(mensagem) {
        return window.confirm(mensagem);
    },

    /**
     * Mostrar prompt
     */
    prompt(mensagem, valorPadrao = '') {
        return window.prompt(mensagem, valorPadrao);
    }
};
