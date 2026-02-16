// frontend/src/ui/modules/buttons.js

/**
 * Gerenciador de Botões
 */

export const Buttons = {
    /**
     * Desabilitar todos os botões de importação
     */
    disableImportButtons(disable) {
        const botoes = document.querySelectorAll('[data-action], .import-item .btn');
        botoes.forEach(btn => {
            btn.disabled = disable;
        });
    },

    /**
     * Definir estado de carregamento de um botão
     */
    setLoading(button, loading, loadingText = '⏳ Carregando...') {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    },

    /**
     * Reset button state
     */
    reset(button) {
        if (!button) return;
        
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
    }
};


