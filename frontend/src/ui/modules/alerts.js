// frontend/src/ui/modules/alerts.js

/**
 * Gerenciador de Alertas
 * Exibe mensagens de feedback para o usuário
 */

export const Alerts = {
    /**
     * Mostrar alerta
     */
    show(mensagem, tipo = 'info', duracao = 5000) {
        const alertDiv = document.getElementById('configStatus');
        if (!alertDiv) {
            console.warn('Elemento de alerta não encontrado');
            return;
        }
        
        alertDiv.className = `alert alert-${tipo} show`;
        alertDiv.textContent = mensagem;
        alertDiv.style.display = 'block';

        // Auto-esconder
        if (duracao > 0) {
            setTimeout(() => this.hide(), duracao);
        }
    },

    /**
     * Esconder alerta
     */
    hide() {
        const alertDiv = document.getElementById('configStatus');
        if (alertDiv) {
            alertDiv.style.display = 'none';
            alertDiv.className = 'alert';
        }
    },

    /**
     * Alerta de sucesso
     */
    success(mensagem, duracao = 5000) {
        this.show(mensagem, 'success', duracao);
    },

    /**
     * Alerta de erro
     */
    error(mensagem, duracao = 5000) {
        this.show(mensagem, 'error', duracao);
    },

    /**
     * Alerta de aviso
     */
    warning(mensagem, duracao = 5000) {
        this.show(mensagem, 'warning', duracao);
    },

    /**
     * Alerta de informação
     */
    info(mensagem, duracao = 5000) {
        this.show(mensagem, 'info', duracao);
    }
};