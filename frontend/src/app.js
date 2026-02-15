// frontend/src/app.js

/**
 * Aplicação Principal
 * Inicializa e gerencia eventos
 */

// Aguardar componentes serem carregados
document.addEventListener('componentsLoaded', () => {
    console.log('🚀 Aplicação iniciada');

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    /**
     * Carregar configurações salvas
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

    // ========================================
    // EVENTOS - CONFIGURAÇÃO
    // ========================================

    /**
     * Abrir modal de configuração
     */
    const btnConfig = document.getElementById('btnConfig');
    if (btnConfig) {
        btnConfig.addEventListener('click', () => {
            UI.mostrarConfig();
        });
    }

    /**
     * Fechar modal de configuração
     */
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

    /**
     * Toggle de senha
     */
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    if (btnTogglePassword) {
        btnTogglePassword.addEventListener('click', () => {
            UI.togglePassword();
        });
    }

    /**
     * Testar conexão
     */
    const btnTestarConexao = document.getElementById('btnTestarConexao');
    if (btnTestarConexao) {
        btnTestarConexao.addEventListener('click', async () => {
            const apiUrl = document.getElementById('apiUrl').value;
            const apiKey = document.getElementById('apiKey').value;
            const apiLoja = document.getElementById('apiLoja').value;

            // Validar
            const validacao = Config.validar(apiUrl, apiKey, apiLoja);
            if (!validacao.valido) {
                UI.mostrarAlerta(validacao.erros.join(', '), 'error');
                return;
            }

            // Configurar API temporariamente
            API.configurar(apiUrl, apiKey, apiLoja);

            // Testar
            btnTestarConexao.disabled = true;
            btnTestarConexao.textContent = '⏳ Testando...';

            const resultado = await API.testarConexao();

            btnTestarConexao.disabled = false;
            btnTestarConexao.textContent = '🔗 Testar Conexão';

            if (resultado.success) {
                UI.mostrarAlerta(
                    `✅ Conexão OK! Empresa: ${resultado.data.razaoSocial}`,
                    'success'
                );
            } else {
                UI.mostrarAlerta(`❌ ${resultado.error}`, 'error');
            }
        });
    }

    /**
     * Salvar configurações
     */
    const formConfig = document.getElementById('formConfig');
    if (formConfig) {
        formConfig.addEventListener('submit', (e) => {
            e.preventDefault();

            const apiUrl = document.getElementById('apiUrl').value;
            const apiKey = document.getElementById('apiKey').value;
            const apiLoja = document.getElementById('apiLoja').value;
            const salvarCredenciais = document.getElementById('salvarCredenciais').checked;

            // Validar
            const validacao = Config.validar(apiUrl, apiKey, apiLoja);
            if (!validacao.valido) {
                UI.mostrarAlerta(validacao.erros.join(', '), 'error');
                return;
            }

            // Salvar
            Config.salvar(apiUrl, apiKey, apiLoja, salvarCredenciais);
            API.configurar(apiUrl, apiKey, apiLoja);

            UI.mostrarAlerta('Configurações salvas com sucesso!', 'success');
            UI.log('⚙️  Configurações salvas', 'success');

            // Testar conexão e fechar modal
            setTimeout(() => {
                testarConexao();
            }, 1000);
        });
    }

    // ========================================
    // EVENTOS - IMPORTAÇÃO
    // ========================================

    /**
     * Botões individuais de importação
     */
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', async (e) => {
            const action = e.target.getAttribute('data-action');
            const card = e.target.closest('.import-card');

            // Verificar se está configurado
            if (!Config.estaConfigurado()) {
                UI.mostrarAlerta('Configure a API antes de importar', 'error');
                UI.mostrarConfig();
                return;
            }

            // Executar ação correspondente
            try {
                switch (action) {
                    case 'importar-hierarquia':
                        await Importacao.importarHierarquia(card);
                        break;
                    case 'importar-marcas':
                        await Importacao.importarMarcas(card);
                        break;
                    case 'importar-produtos':
                        await Importacao.importarProdutos(card);
                        break;
                    case 'importar-clientes':
                        await Importacao.importarClientes(card);
                        break;
                    case 'importar-fornecedores':
                        await Importacao.importarFornecedores(card);
                        break;
                    case 'importar-categorias':
                        await Importacao.importarCategorias(card);
                        break;
                }
            } catch (error) {
                console.error('Erro na importação:', error);
            }
        });
    });

    /**
     * Botão Importar Tudo
     */
    const btnImportarTudo = document.getElementById('btnImportarTudo');
    if (btnImportarTudo) {
        btnImportarTudo.addEventListener('click', async () => {
            // Verificar se está configurado
            if (!Config.estaConfigurado()) {
                UI.mostrarAlerta('Configure a API antes de importar', 'error');
                UI.mostrarConfig();
                return;
            }

            // Confirmar
            const confirmar = UI.confirmar(
                'Deseja importar todos os dados?\n\n' +
                'Isso pode levar alguns minutos dependendo do volume de dados.'
            );

            if (!confirmar) {
                return;
            }

            // Executar
            await Importacao.importarTudo();
        });
    }

    /**
     * Limpar log
     */
    const btnLimparLog = document.getElementById('btnLimparLog');
    if (btnLimparLog) {
        btnLimparLog.addEventListener('click', () => {
            UI.limparLog();
            UI.log('🗑️  Log limpo', 'info');
        });
    }

    // ========================================
    // ATALHOS DE TECLADO
    // ========================================

    document.addEventListener('keydown', (e) => {
        // Ctrl + K = Abrir configuração
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            UI.mostrarConfig();
        }

        // Esc = Fechar configuração
        if (e.key === 'Escape') {
            const configSection = document.getElementById('sectionConfig');
            if (configSection && configSection.style.display !== 'none') {
                if (Config.estaConfigurado()) {
                    UI.esconderConfig();
                }
            }
        }
    });

    // ========================================
    // INICIAR APLICAÇÃO
    // ========================================

    inicializar();
    
    console.log('✅ Aplicação pronta');
});