// frontend/src/ui/modules/log.js

/**
 * Gerenciador de Log
 */

export const Log = {
    /**
     * Adicionar entrada no log
     */
    add(mensagem, tipo = 'info') {
        const logContainer = document.getElementById('logContainer');
        if (!logContainer) return;
        
        // Remover mensagem de "vazio" se existir
        const emptyDiv = logContainer.querySelector('.log-empty');
        if (emptyDiv) {
            emptyDiv.remove();
        }

        const timestamp = new Date().toLocaleTimeString('pt-BR');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${tipo}`;
        logEntry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${mensagem}`;
        
        logContainer.appendChild(logEntry);
        
        // Scroll para o final
        logContainer.scrollTop = logContainer.scrollHeight;
    },

    /**
     * Limpar log
     */
    clear() {
        const logContainer = document.getElementById('logContainer');
        if (!logContainer) return;
        
        logContainer.innerHTML = '<div class="log-empty">Nenhuma atividade registrada ainda</div>';
    },

    /**
     * Logs por tipo
     */
    info(mensagem) {
        this.add(mensagem, 'info');
    },

    success(mensagem) {
        this.add(mensagem, 'success');
    },

    error(mensagem) {
        this.add(mensagem, 'error');
    },

    warning(mensagem) {
        this.add(mensagem, 'warning');
    }
};