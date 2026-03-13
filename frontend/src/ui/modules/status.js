// frontend/src/ui/modules/status.js

/**
 * Gerenciador de Status
 */

export const Status = {
    /**
     * Atualizar status de conexão
     */
    updateConnection(conectado) {
        const statusElement = document.getElementById('statusConexao');
        if (!statusElement) return;
        
        if (conectado) {
            statusElement.classList.add('connected');
            statusElement.classList.remove('error');
            const statusText = statusElement.querySelector('.status-text');
            if (statusText) statusText.textContent = 'Conectado';
        } else {
            statusElement.classList.remove('connected');
            statusElement.classList.add('error');
            const statusText = statusElement.querySelector('.status-text');
            if (statusText) statusText.textContent = 'Desconectado';
        }
    },

    /**
     * Atualizar status de importação
     */
    updateImport(item, status, mensagem = '') {
        if (!item) return;
        
        const statusDiv = item.querySelector('.import-item-status, .import-status');
        const progressBar = item.querySelector('.import-item-progress, .progress-bar');
        const progressFill = item.querySelector('.import-item-progress-fill, .progress-fill');
        const button = item.querySelector('.btn');

        switch (status) {
            case 'loading':
                if (button) {
                    button.disabled = true;
                    button.textContent = '⏳ Processando...';
                }
                if (progressBar) {
                    progressBar.style.display = 'block';
                    progressBar.classList.add('active');
                }
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    statusDiv.className = statusDiv.classList.contains('import-item-status') ? 
                        'import-item-status loading' : 'import-status loading';
                    statusDiv.textContent = mensagem;
                }
                break;

            case 'progress':
                if (progressFill) {
                    progressFill.style.width = `${mensagem}%`;
                }
                break;

            case 'success':
                if (button) {
                    button.disabled = false;
                    button.textContent = 'Importar';
                }
                if (progressBar) {
                    progressBar.style.display = 'none';
                    progressBar.classList.remove('active');
                }
                if (statusDiv) {
                    statusDiv.className = statusDiv.classList.contains('import-item-status') ? 
                        'import-item-status success' : 'import-status success';
                    statusDiv.style.display = 'block';
                    statusDiv.textContent = `✅ ${mensagem}`;
                }
                break;

            case 'error':
                if (button) {
                    button.disabled = false;
                    button.textContent = 'Importar';
                }
                if (progressBar) {
                    progressBar.style.display = 'none';
                    progressBar.classList.remove('active');
                }
                if (statusDiv) {
                    statusDiv.className = statusDiv.classList.contains('import-item-status') ? 
                        'import-item-status error' : 'import-status error';
                    statusDiv.style.display = 'block';
                    statusDiv.textContent = `❌ ${mensagem}`;
                }
                break;
        }
    }
};