// frontend/src/app.js
/**
 * Aplicação Principal
 * Entry point único - importa e inicializa todos os módulos
 */

// Importar módulos core
import ComponentLoader from './core/component-loader.js';
import ThemeManager from './core/theme-manager.js';

// Importar módulos services
import Config from './services/config.js';
import API from './services/api.js';

// Importar módulos UI
import UI from './ui/ui.js';
import TabsManager from './ui/tabs.js';

// Importar módulos features
import Importacao from './features/importacao.js';

/**
 * Aguardar componentes serem carregados
 */
document.addEventListener('componentsLoaded', () => {
    console.log('🚀 Aplicação iniciada');

    // Carregar configurações salvas
    inicializar();
    
    // Configurar event listeners
    setupEventListeners();
});

/**
 * Carregar configurações e testar conexão
 */
function inicializar() {
    UI.carregarConfigNoFormulario();

    // Verificar se está configurado
    if (Config.estaConfigurado()) {
        const config = Config.carregar();
        API.configurar(config.apiUrl, config.apiKey, config.apiLoja);
        
        // Testar conexão automaticamente
        testarConexao();
    } else {
        // Mostrar tela de configuração
        UI.mostrarConfig();
    }
}

/**
 * Testar conexão com a API
 */
async function testarConexao() {
    try {
        const resultado = await API.testarConexao();
        
        if (resultado.success) {
            UI.atualizarStatusConexao(true);
            UI.esconderConfig();
        } else {
            UI.atualizarStatusConexao(false);
            UI.mostrarAlerta(`Erro na conexão: ${resultado.error}`, 'error');
        }
    } catch (error) {
        UI.atualizarStatusConexao(false);
        UI.mostrarAlerta(`Erro ao testar conexão: ${error.message}`, 'error');
    }
}

/**
 * Configurar todos os event listeners da aplicação
 */
function setupEventListeners() {

    // Abrir modal de configuração
    const btnConfig = document.getElementById('btnConfig');
    if (btnConfig) {
        btnConfig.addEventListener('click', () => {
            UI.mostrarConfig();
        });
    }

    // Fechar modal de configuração
    const btnCloseConfig = document.getElementById('btnCloseConfig');
    if (btnCloseConfig) {
        btnCloseConfig.addEventListener('click', () => {
            if (Config.estaConfigurado()) {
                UI.esconderConfig();
            } else {
                UI.mostrarAlerta('Configure a API antes de continuar', 'error');
            }
        });
    }

    // Toggle de senha
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    if (btnTogglePassword) {
        btnTogglePassword.addEventListener('click', () => {
            const input = document.getElementById('inputApiKey');
            const icon = btnTogglePassword.querySelector('span');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '🙈';
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
            }
        });
    }

    // Salvar configurações
    const formConfig = document.getElementById('formConfig');
    if (formConfig) {
        formConfig.addEventListener('submit', async (e) => {
            e.preventDefault();
            await salvarConfiguracao();
        });
    }

    // Testar conexão
    const btnTestarConexao = document.getElementById('btnTestarConexao');
    if (btnTestarConexao) {
        btnTestarConexao.addEventListener('click', async () => {
            await testarConexao();
        });
    }

    // Limpar log
    const btnLimparLog = document.getElementById('btnLimparLog');
    if (btnLimparLog) {
        btnLimparLog.addEventListener('click', () => {
            UI.limparLog();
        });
    }
}

/**
 * Salvar configuração da API
 */
async function salvarConfiguracao() {
    const apiUrl = document.getElementById('inputApiUrl').value.trim();
    const apiKey = document.getElementById('inputApiKey').value.trim();
    const apiLoja = document.getElementById('inputApiLoja').value.trim();

    // Validar campos
    if (!apiUrl || !apiKey || !apiLoja) {
        UI.mostrarAlerta('Preencha todos os campos', 'error');
        return;
    }

    // Validar formato da URL
    try {
        new URL(apiUrl);
    } catch {
        UI.mostrarAlerta('URL inválida', 'error');
        return;
    }

    // Salvar configuração
    Config.salvar({ apiUrl, apiKey, apiLoja });
    API.configurar(apiUrl, apiKey, apiLoja);

    UI.mostrarAlerta('✅ Configuração salva!', 'success');
    UI.log('⚙️ Configuração atualizada', 'info');

    // Testar conexão automaticamente
    await testarConexao();
}

// ========================================
// EXPORTS (para uso no console)
// ========================================

// Exportar para window para debug no console
window.App = {
    Config,
    API,
    UI,
    TabsManager,
    Importacao,
    ComponentLoader,
    ThemeManager
};

console.log('✅ Aplicação carregada. Use window.App para acessar os módulos no console.');