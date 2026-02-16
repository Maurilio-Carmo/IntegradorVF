// frontend/src/app.js

/**
 * Aplicação Principal
 * Ponto de entrada da aplicação
 */

import ComponentLoader from './core/component-loader.js';
import ThemeManager from './core/theme-manager.js';
import Config from './services/config.js';
import Importacao from './features/importacao.js';
import API from './services/api.js';
import UI from './ui/ui.js';
import Tabs from './ui/tabs.js';

/**
 * Inicializar aplicação
 */
async function init() {
    console.log('🚀 Iniciando aplicação...');

    // Aguardar carregamento dos componentes
    await waitForComponents();

    // Inicializar tema
    ThemeManager.init();
    ThemeManager.addToHeader();

    // Carregar configuração salva
    await carregarConfiguracao();

    // Configurar event listeners
    setupEventListeners();

    // Inicializar sistema de tabs
    Tabs.init();

    // Atualizar estatísticas do banco
    await Importacao.atualizarEstatisticasDoBanco();

    console.log('✅ Aplicação inicializada!');
    UI.log('🎯 Sistema pronto para uso!', 'success');
}

/**
 * Aguardar carregamento dos componentes
 */
function waitForComponents() {
    return new Promise((resolve) => {
        if (document.querySelector('#header-component')?.children.length > 0) {
            resolve();
        } else {
            document.addEventListener('componentsLoaded', resolve, { once: true });
        }
    });
}

/**
 * Carregar configuração salva
 */
async function carregarConfiguracao() {
    const config = Config.carregar();
    
    if (config) {
        console.log('⚙️ Configuração encontrada');
        API.configurar(config.apiUrl, config.apiKey, config.loja);
        
        // Preencher formulário
        const form = document.getElementById('formConfig');
        if (form) {
            form.querySelector('#apiUrl').value = config.apiUrl;
            form.querySelector('#apiKey').value = config.apiKey;
            form.querySelector('#apiLoja').value = config.loja;
        }

        UI.log('✅ Configuração carregada', 'success');
    } else {
        console.log('⚠️ Nenhuma configuração encontrada');
        UI.log('⚠️ Configure a API para começar', 'warning');
    }
}

/**
 * Salvar configuração
 */
async function salvarConfiguracao() {
    const form = document.getElementById('formConfig');
    
    const apiUrl = form.querySelector('#apiUrl').value.trim();
    const apiKey = form.querySelector('#apiKey').value.trim();
    const loja = parseInt(form.querySelector('#apiLoja').value);

    if (!apiUrl || !apiKey || !loja) {
        UI.mostrarAlerta('Preencha todos os campos', 'error');
        return;
    }

    // Validar configuração
    const validacao = Config.validar(apiUrl, apiKey, loja);
    if (!validacao.valido) {
        UI.mostrarAlerta(validacao.erros.join('\n'), 'error');
        return;
    }

    // Salvar configuração
    Config.salvar({ apiUrl, apiKey, loja });
    API.configurar(apiUrl, apiKey, loja);

    UI.log('💾 Configuração salva com sucesso', 'success');
    UI.mostrarAlerta('Configuração salva com sucesso!', 'success');

    // Fechar modal
    UI.fecharConfig();
}

/**
 * Testar conexão com a API
 */
async function testarConexao() {
    const form = document.getElementById('formConfig');
    
    const apiUrl = form.querySelector('#apiUrl').value.trim();
    const apiKey = form.querySelector('#apiKey').value.trim();
    const loja = parseInt(form.querySelector('#apiLoja').value);

    if (!apiUrl || !apiKey || !loja) {
        UI.mostrarAlerta('Preencha todos os campos antes de testar', 'error');
        return;
    }

    // Configurar temporariamente
    API.configurar(apiUrl, apiKey, loja);

    const btnTestar = document.getElementById('btnTestarConexao');
    btnTestar.disabled = true;
    btnTestar.textContent = '🔄 Testando...';

    try {
        const resultado = await API.testarConexao();
        
        if (resultado.success) {
            UI.mostrarAlerta('✅ Conexão estabelecida com sucesso!', 'success');
        } else {
            UI.mostrarAlerta('❌ Falha na conexão: ' + resultado.error, 'error');
        }
    } finally {
        btnTestar.disabled = false;
        btnTestar.textContent = '🔍 Testar Conexão';
    }
}

/**
 * Toggle de senha
 */
function toggleSenha() {
    const input = document.getElementById('apiKey');
    const icon = document.querySelector('#btnTogglePassword span');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.textContent = '🙈';
    } else {
        input.type = 'password';
        if (icon) icon.textContent = '👁️';
    }
}

/**
 * Configurar event listeners globais
 */
function setupEventListeners() {
    // Botão de configuração
    const btnConfig = document.getElementById('btnConfig');
    if (btnConfig) {
        btnConfig.addEventListener('click', () => {
            UI.mostrarConfig();
        });
    }

    // Fechar modal de configuração (X)
    const btnFecharConfig = document.getElementById('btnFecharConfig');
    if (btnFecharConfig) {
        btnFecharConfig.addEventListener('click', () => {
            UI.fecharConfig();
        });
    }

    // Fechar modal de configuração (Botão Fechar)
    const btnCloseConfig = document.getElementById('btnCloseConfig');
    if (btnCloseConfig) {
        btnCloseConfig.addEventListener('click', () => {
            UI.fecharConfig();
        });
    }

    // Toggle de senha
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    if (btnTogglePassword) {
        btnTogglePassword.addEventListener('click', toggleSenha);
    }

    // Salvar configuração
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

    // Fechar modal ao clicar fora
    const modalConfig = document.getElementById('modalConfig');
    if (modalConfig) {
        modalConfig.addEventListener('click', (e) => {
            if (e.target === modalConfig) {
                UI.fecharConfig();
            }
        });
    }

    // ESC para fechar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modalConfig');
            if (modal && modal.classList.contains('active')) {
                UI.fecharConfig();
            }
        }
    });

    // Listener para mudança de tema
    document.addEventListener('themeChanged', (e) => {
        console.log(`🎨 Tema alterado para: ${e.detail.theme}`);
        UI.log(`🎨 Tema alterado para: ${e.detail.theme}`, 'info');
    });
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exportar funções úteis
export { init, salvarConfiguracao, testarConexao, toggleSenha };