// frontend/src/ui/ui.js

/**
 * Módulo de Interface do Usuário
 * Gerencia elementos visuais e interações
 */

import Config from "../services/config.js";

const UI = {
    /**
     * Mostrar seção de configuração
     */
    mostrarConfig() {
        document.getElementById('sectionConfig').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
    },

    /**
     * Esconder seção de configuração
     */
    esconderConfig() {
        document.getElementById('sectionConfig').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
    },

    /**
     * Atualizar status de conexão
     */
    atualizarStatusConexao(conectado) {
        const statusElement = document.getElementById('statusConexao');
        
        if (conectado) {
            statusElement.classList.add('connected');
            statusElement.classList.remove('error');
            statusElement.querySelector('.status-text').textContent = 'Conectado';
        } else {
            statusElement.classList.remove('connected');
            statusElement.classList.add('error');
            statusElement.querySelector('.status-text').textContent = 'Desconectado';
        }
    },

    /**
     * Atualizar estatísticas
     */
    atualizarEstatisticas(stats) {
        if (stats.secoes !== undefined) {
            document.getElementById('statSecoes').textContent = stats.secoes;
        }
        if (stats.grupos !== undefined) {
            document.getElementById('statGrupos').textContent = stats.grupos;
        }
        if (stats.marcas !== undefined) {
            document.getElementById('statMarcas').textContent = stats.marcas;
        }
        if (stats.produtos !== undefined) {
            document.getElementById('statProdutos').textContent = stats.produtos;
        }
        if (stats.clientes !== undefined) {
            document.getElementById('statClientes').textContent = stats.clientes;
        }
        if (stats.fornecedores !== undefined) {
            document.getElementById('statFornecedores').textContent = stats.fornecedores;
        }
    },

    /**
     * Mostrar/Esconder senha
     */
    togglePassword() {
        const input = document.getElementById('apiKey');
        const icon = document.querySelector('.eye-icon');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = '🙈';
        } else {
            input.type = 'password';
            icon.textContent = '👁️';
        }
    },

    /**
     * Mostrar alerta
     */
    mostrarAlerta(mensagem, tipo = 'info') {
        const alertDiv = document.getElementById('configStatus');
        if (!alertDiv) return;
        
        alertDiv.className = `alert alert-${tipo}`;
        alertDiv.textContent = mensagem;
        alertDiv.style.display = 'block';

        // Auto-esconder após 5 segundos
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    },

    /**
     * Adicionar entrada no log
     */
    log(mensagem, tipo = 'info') {
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
    limparLog() {
        const logContainer = document.getElementById('logContainer');
        if (!logContainer) return;
        
        logContainer.innerHTML = '<div class="log-empty">Nenhuma atividade registrada ainda</div>';
    },

    /**
     * Atualizar status de importação em um item (para tabs)
     */
    atualizarStatusImportacao(item, status, mensagem = '') {
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
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
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
    },

    /**
     * Desabilitar todos os botões de importação
     */
    desabilitarBotoesImportacao(desabilitar) {
        const botoes = document.querySelectorAll('[data-action], .import-item .btn');
        botoes.forEach(btn => {
            btn.disabled = desabilitar;
        });
    },

    /**
     * Mostrar confirmação
     */
    confirmar(mensagem) {
        return confirm(mensagem);
    },

    /**
     * Carregar configurações no formulário
     */
    carregarConfigNoFormulario() {
        const config = Config.carregar();
        
        // Se não houver configuração salva, usar valores padrão
        if (!config) {
            return;
        }
        
        const urlInput = document.getElementById('apiUrl');
        const keyInput = document.getElementById('apiKey');
        const lojaInput = document.getElementById('apiLoja');
        const saveInput = document.getElementById('salvarCredenciais');
        
        if (urlInput && config.apiUrl) urlInput.value = config.apiUrl;
        if (keyInput && config.apiKey) keyInput.value = config.apiKey;
        if (lojaInput && config.apiLoja) lojaInput.value = config.apiLoja;
        if (saveInput) saveInput.checked = config.salvarCredenciais;
    },

    /**
     * Animar contador
     */
    animarContador(elementId, valorFinal, duracao = 1000) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const inicio = parseInt(element.textContent) || 0;
        const incremento = (valorFinal - inicio) / (duracao / 16);
        let valorAtual = inicio;

        const animar = () => {
            valorAtual += incremento;
            
            if ((incremento > 0 && valorAtual >= valorFinal) || 
                (incremento < 0 && valorAtual <= valorFinal)) {
                element.textContent = valorFinal;
            } else {
                element.textContent = Math.floor(valorAtual);
                requestAnimationFrame(animar);
            }
        };

        animar();
    }
};

// Exportar para uso global
export default UI;