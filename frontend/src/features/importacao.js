// frontend/src/features/importacao.js

/**
 * Módulo de Importação
 * Gerencia o processo de importação de dados da API e gravação no banco
 */

import API from '../services/api.js';
import UI from '../ui/ui.js';

const Importacao = {
    /**
     * Salvar dados no banco local via API backend
     */
    async salvarNoBanco(endpoint, dados) {
        try {
            const response = await fetch(`http://localhost:3000/api/importacao/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: dados })
            });

            if (!response.ok) {
                throw new Error(`Erro ao salvar no banco: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao salvar no banco:', error);
            throw error;
        }
    },

    /**
     * Buscar estatísticas do banco
     */
    async buscarEstatisticas() {
        try {
            const response = await fetch('http://localhost:3000/api/importacao/estatisticas');
            if (!response.ok) {
                throw new Error('Erro ao buscar estatísticas');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return null;
        }
    },

    /**
     * Método genérico de importação
     */
    async importarEntidade(config) {
        const { nome, endpoint, metodoAPI, card, estimativa = 500 } = config;
        
        try {
            UI.log(`📥 Iniciando importação de ${nome}...`, 'info');
            UI.atualizarStatusImportacao(card, 'loading', `Buscando ${nome}...`);

            const dados = await metodoAPI((total) => {
                UI.log(`   📄 ${nome}: ${total} registros`, 'info');
                const percentual = Math.min(Math.floor((total / estimativa) * 100), 99);
                UI.atualizarStatusImportacao(card, 'progress', percentual);
            });

            UI.log(`✅ ${dados.length} ${nome} buscados da API`, 'success');

            // Salvar no banco
            UI.log(`💾 Salvando ${nome} no banco...`, 'info');
            await this.salvarNoBanco(endpoint, dados);
            UI.log(`✅ ${dados.length} ${nome} salvos no banco`, 'success');

            UI.atualizarStatusImportacao(card, 'success', `${dados.length} registros`);
            
            // Atualizar estatísticas do banco
            await this.atualizarEstatisticasDoBanco();

            return dados;
        } catch (error) {
            UI.log(`❌ Erro ao importar ${nome}: ${error.message}`, 'error');
            UI.atualizarStatusImportacao(card, 'error', error.message);
            throw error;
        }
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - PRODUTOS
    // ========================================

    async importarSecoes(card) {
        return await this.importarEntidade({
            nome: 'seções',
            endpoint: 'secoes',
            metodoAPI: API.buscarSecoes.bind(API),
            card,
            estimativa: 100
        });
    },

    async importarGrupos(card) {
        return await this.importarEntidade({
            nome: 'grupos',
            endpoint: 'grupos',
            metodoAPI: API.buscarGrupos.bind(API),
            card,
            estimativa: 500
        });
    },

    async importarSubgrupos(card) {
        return await this.importarEntidade({
            nome: 'subgrupos',
            endpoint: 'subgrupos',
            metodoAPI: API.buscarSubgrupos.bind(API),
            card,
            estimativa: 1000
        });
    },

    async importarMarcas(card) {
        return await this.importarEntidade({
            nome: 'marcas',
            endpoint: 'marcas',
            metodoAPI: API.buscarMarcas.bind(API),
            card,
            estimativa: 500
        });
    },

    async importarFamilias(card) {
        return await this.importarEntidade({
            nome: 'famílias',
            endpoint: 'familias',
            metodoAPI: API.buscarFamilias.bind(API),
            card,
            estimativa: 200
        });
    },

    async importarProdutos(card) {
        return await this.importarEntidade({
            nome: 'produtos',
            endpoint: 'produtos',
            metodoAPI: API.buscarProdutos.bind(API),
            card,
            estimativa: 5000
        });
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - PESSOAS
    // ========================================

    async importarClientes(card) {
        return await this.importarEntidade({
            nome: 'clientes',
            endpoint: 'clientes',
            metodoAPI: API.buscarClientes.bind(API),
            card,
            estimativa: 1000
        });
    },

    async importarFornecedores(card) {
        return await this.importarEntidade({
            nome: 'fornecedores',
            endpoint: 'fornecedores',
            metodoAPI: API.buscarFornecedores.bind(API),
            card,
            estimativa: 300
        });
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - OPERACIONAL
    // ========================================

    async importarLojas(card) {
        return await this.importarEntidade({
            nome: 'lojas',
            endpoint: 'lojas',
            metodoAPI: API.buscarLojas.bind(API),
            card,
            estimativa: 50
        });
    },

    async importarCaixas(card) {
        return await this.importarEntidade({
            nome: 'caixas',
            endpoint: 'caixas',
            metodoAPI: API.buscarCaixas.bind(API),
            card,
            estimativa: 100
        });
    },

    async importarLocalEstoque(card) {
        return await this.importarEntidade({
            nome: 'locais de estoque',
            endpoint: 'local-estoque',
            metodoAPI: API.buscarLocalEstoque.bind(API),
            card,
            estimativa: 50
        });
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - FINANCEIRO
    // ========================================

    async importarAgentes(card) {
        return await this.importarEntidade({
            nome: 'agentes',
            endpoint: 'agentes',
            metodoAPI: API.buscarAgentes.bind(API),
            card,
            estimativa: 100
        });
    },

    async importarCategorias(card) {
        return await this.importarEntidade({
            nome: 'categorias',
            endpoint: 'categorias',
            metodoAPI: API.buscarCategorias.bind(API),
            card,
            estimativa: 200
        });
    },

    async importarContasCorrentes(card) {
        return await this.importarEntidade({
            nome: 'contas correntes',
            endpoint: 'contas-correntes',
            metodoAPI: API.buscarContasCorrentes.bind(API),
            card,
            estimativa: 100
        });
    },

    async importarEspeciesDocumento(card) {
        return await this.importarEntidade({
            nome: 'espécies de documento',
            endpoint: 'especies-documento',
            metodoAPI: API.buscarEspeciesDocumento.bind(API),
            card,
            estimativa: 50
        });
    },

    async importarHistoricoPadrao(card) {
        return await this.importarEntidade({
            nome: 'histórico padrão',
            endpoint: 'historico-padrao',
            metodoAPI: API.buscarHistoricoPadrao.bind(API),
            card,
            estimativa: 100
        });
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - MOTIVOS
    // ========================================

    async importarMotivosCancelamento(card) {
        return await this.importarEntidade({
            nome: 'motivos de cancelamento',
            endpoint: 'motivos-cancelamento',
            metodoAPI: API.buscarMotivosCancelamento.bind(API),
            card,
            estimativa: 50
        });
    },

    async importarMotivosDesconto(card) {
        return await this.importarEntidade({
            nome: 'motivos de desconto',
            endpoint: 'motivos-desconto',
            metodoAPI: API.buscarMotivosDesconto.bind(API),
            card,
            estimativa: 50
        });
    },

    async importarMotivosDevolucao(card) {
        return await this.importarEntidade({
            nome: 'motivos de devolução',
            endpoint: 'motivos-devolucao',
            metodoAPI: API.buscarMotivosDevolucao.bind(API),
            card,
            estimativa: 50
        });
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - PDV
    // ========================================

    async importarPagamentosPDV(card) {
        return await this.importarEntidade({
            nome: 'pagamentos PDV',
            endpoint: 'pagamentos-pdv',
            metodoAPI: API.buscarPagamentosPDV.bind(API),
            card,
            estimativa: 50
        });
    },

    async importarRecebimentosPDV(card) {
        return await this.importarEntidade({
            nome: 'recebimentos PDV',
            endpoint: 'recebimentos-pdv',
            metodoAPI: API.buscarRecebimentosPDV.bind(API),
            card,
            estimativa: 50
        });
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - FISCAL
    // ========================================

    async importarImpostosFederais(card) {
        return await this.importarEntidade({
            nome: 'impostos federais',
            endpoint: 'impostos-federais',
            metodoAPI: API.buscarImpostosFederais.bind(API),
            card,
            estimativa: 50
        });
    },

    async importarRegimeTributario(card) {
        return await this.importarEntidade({
            nome: 'regime tributário',
            endpoint: 'regime-tributario',
            metodoAPI: API.buscarRegimeTributario.bind(API),
            card,
            estimativa: 50
        });
    },

    async importarSituacoesFiscais(card) {
        return await this.importarEntidade({
            nome: 'situações fiscais',
            endpoint: 'situacoes-fiscais',
            metodoAPI: API.buscarSituacoesFiscais.bind(API),
            card,
            estimativa: 100
        });
    },

    async importarTabelasTributariasEntrada(card) {
        return await this.importarEntidade({
            nome: 'tabelas tributárias de entrada',
            endpoint: 'tabelas-tributarias-entrada',
            metodoAPI: API.buscarTabelasTributariasEntrada.bind(API),
            card,
            estimativa: 100
        });
    },

    async importarTabelasTributariasSaida(card) {
        return await this.importarEntidade({
            nome: 'tabelas tributárias de saída',
            endpoint: 'tabelas-tributarias-saida',
            metodoAPI: API.buscarTabelasTributariasSaida.bind(API),
            card,
            estimativa: 100
        });
    },

    async importarTiposOperacoes(card) {
        return await this.importarEntidade({
            nome: 'tipos de operações',
            endpoint: 'tipos-operacoes',
            metodoAPI: API.buscarTiposOperacoes.bind(API),
            card,
            estimativa: 100
        });
    },

    // ========================================
    // IMPORTAÇÕES ESPECÍFICAS - ESTOQUE
    // ========================================

    async importarTiposAjustes(card) {
        return await this.importarEntidade({
            nome: 'tipos de ajustes',
            endpoint: 'tipos-ajustes',
            metodoAPI: API.buscarTiposAjustes.bind(API),
            card,
            estimativa: 50
        });
    },

    // ========================================
    // IMPORTAÇÕES AGRUPADAS
    // ========================================

    /**
     * Importar hierarquia mercadológica completa
     */
    async importarHierarquiaCompleta(cardSecoes, cardGrupos, cardSubgrupos) {
        try {
            UI.log('🌳 Iniciando importação de hierarquia completa...', 'info');
            
            await this.importarSecoes(cardSecoes);
            await this.importarGrupos(cardGrupos);
            await this.importarSubgrupos(cardSubgrupos);
            
            UI.log('✅ Hierarquia completa importada!', 'success');
        } catch (error) {
            UI.log(`❌ Erro na hierarquia: ${error.message}`, 'error');
            throw error;
        }
    },

    /**
     * Importar cadastros de produtos
     */
    async importarCadastrosProdutos() {
        try {
            UI.log('📦 Iniciando importação de cadastros de produtos...', 'info');
            
            const cards = document.querySelectorAll('.import-card');
            
            await this.importarSecoes(cards[0]);
            await this.importarGrupos(cards[1]);
            await this.importarSubgrupos(cards[2]);
            await this.importarMarcas(cards[3]);
            await this.importarFamilias(cards[4]);
            await this.importarProdutos(cards[5]);
            
            UI.log('✅ Cadastros de produtos importados!', 'success');
        } catch (error) {
            UI.log(`❌ Erro nos cadastros: ${error.message}`, 'error');
            throw error;
        }
    },

    /**
     * Atualizar estatísticas do banco de dados na interface
     */
    async atualizarEstatisticasDoBanco() {
        try {
            const stats = await this.buscarEstatisticas();
            if (stats) {
                UI.log('📊 Atualizando estatísticas do banco...', 'info');
                
                // Atualizar cada contador se o elemento existir
                const contadores = {
                    'statSecoes': stats.secoes,
                    'statGrupos': stats.grupos,
                    'statSubgrupos': stats.subgrupos,
                    'statMarcas': stats.marcas,
                    'statFamilias': stats.familias,
                    'statProdutos': stats.produtos,
                    'statClientes': stats.clientes,
                    'statFornecedores': stats.fornecedores,
                    'statLojas': stats.lojas,
                    'statCaixas': stats.caixas,
                    'statLocalEstoque': stats.local_estoque,
                    'statAgentes': stats.agentes,
                    'statCategorias': stats.categorias,
                    'statContasCorrentes': stats.contas_correntes,
                    'statEspeciesDocumento': stats.especies_documento,
                    'statHistoricoPadrao': stats.historico_padrao,
                    'statMotivosCancelamento': stats.motivos_cancelamento,
                    'statMotivosDesconto': stats.motivos_desconto,
                    'statMotivosDevolucao': stats.motivos_devolucao,
                    'statPagamentosPDV': stats.pagamentos_pdv,
                    'statRecebimentosPDV': stats.recebimentos_pdv,
                    'statImpostosFederais': stats.impostos_federais,
                    'statRegimeTributario': stats.regime_tributario,
                    'statSituacoesFiscais': stats.situacoes_fiscais,
                    'statTabelasTributariasEntrada': stats.tabelas_tributarias_entrada,
                    'statTabelasTributariasSaida': stats.tabelas_tributarias_saida,
                    'statTiposOperacoes': stats.tipos_operacoes,
                    'statTiposAjustes': stats.tipos_ajustes
                };

                for (const [id, valor] of Object.entries(contadores)) {
                    if (document.getElementById(id)) {
                        UI.animarContador(id, valor || 0);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
        }
    },

    /**
     * Importar tudo em sequência
     */
    async importarTudo() {
        const startTime = Date.now();
        
        try {
            UI.log('═══════════════════════════════════════', 'info');
            UI.log('🚀 IMPORTAÇÃO COMPLETA INICIADA', 'info');
            UI.log('═══════════════════════════════════════', 'info');

            UI.desabilitarBotoesImportacao(true);

            const cards = document.querySelectorAll('.import-card');
            
            // Executar importações em sequência
            const importacoes = [
                { metodo: 'importarSecoes', nome: 'Seções' },
                { metodo: 'importarGrupos', nome: 'Grupos' },
                { metodo: 'importarSubgrupos', nome: 'Subgrupos' },
                { metodo: 'importarMarcas', nome: 'Marcas' },
                { metodo: 'importarFamilias', nome: 'Famílias' },
                { metodo: 'importarProdutos', nome: 'Produtos' },
                { metodo: 'importarClientes', nome: 'Clientes' },
                { metodo: 'importarFornecedores', nome: 'Fornecedores' },
                { metodo: 'importarLojas', nome: 'Lojas' },
                { metodo: 'importarCaixas', nome: 'Caixas' },
                { metodo: 'importarLocalEstoque', nome: 'Local Estoque' },
                { metodo: 'importarAgentes', nome: 'Agentes' },
                { metodo: 'importarCategorias', nome: 'Categorias' },
                { metodo: 'importarContasCorrentes', nome: 'Contas Correntes' },
                { metodo: 'importarEspeciesDocumento', nome: 'Espécies Documento' },
                { metodo: 'importarHistoricoPadrao', nome: 'Histórico Padrão' },
                { metodo: 'importarMotivosCancelamento', nome: 'Motivos Cancelamento' },
                { metodo: 'importarMotivosDesconto', nome: 'Motivos Desconto' },
                { metodo: 'importarMotivosDevolucao', nome: 'Motivos Devolução' },
                { metodo: 'importarPagamentosPDV', nome: 'Pagamentos PDV' },
                { metodo: 'importarRecebimentosPDV', nome: 'Recebimentos PDV' },
                { metodo: 'importarImpostosFederais', nome: 'Impostos Federais' },
                { metodo: 'importarRegimeTributario', nome: 'Regime Tributário' },
                { metodo: 'importarSituacoesFiscais', nome: 'Situações Fiscais' },
                { metodo: 'importarTabelasTributariasEntrada', nome: 'Tabelas Trib. Entrada' },
                { metodo: 'importarTabelasTributariasSaida', nome: 'Tabelas Trib. Saída' },
                { metodo: 'importarTiposOperacoes', nome: 'Tipos Operações' },
                { metodo: 'importarTiposAjustes', nome: 'Tipos Ajustes' }
            ];

            for (let i = 0; i < importacoes.length && i < cards.length; i++) {
                const imp = importacoes[i];
                try {
                    await this[imp.metodo](cards[i]);
                } catch (error) {
                    UI.log(`⚠️  Erro em ${imp.nome}, continuando...`, 'warning');
                }
            }

            const tempoTotal = ((Date.now() - startTime) / 1000).toFixed(2);
            
            UI.log('═══════════════════════════════════════', 'success');
            UI.log('✅ IMPORTAÇÃO COMPLETA FINALIZADA!', 'success');
            UI.log(`⏱️  Tempo total: ${tempoTotal}s`, 'success');
            UI.log('═══════════════════════════════════════', 'success');

            // Atualizar estatísticas finais
            await this.atualizarEstatisticasDoBanco();

            UI.mostrarAlerta('Importação completa realizada com sucesso!', 'success');

        } catch (error) {
            UI.log('═══════════════════════════════════════', 'error');
            UI.log('❌ ERRO NA IMPORTAÇÃO COMPLETA', 'error');
            UI.log(`Erro: ${error.message}`, 'error');
            UI.log('═══════════════════════════════════════', 'error');

            UI.mostrarAlerta(`Erro na importação: ${error.message}`, 'error');
        } finally {
            UI.desabilitarBotoesImportacao(false);
        }
    }
};

// Exportar para uso global
export default Importacao;