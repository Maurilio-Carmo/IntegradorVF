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
     * Importar hierarquia mercadológica (Seções, Grupos, Subgrupos)
     */
    async importarHierarquia(card) {
        try {
            UI.log('🌳 Iniciando importação de hierarquia...', 'info');
            UI.atualizarStatusImportacao(card, 'loading', 'Buscando seções...');

            // 1. Seções
            const secoes = await API.buscarSecoes((total) => {
                UI.log(`   📄 Seções: ${total} registros`, 'info');
            });
            UI.log(`✅ ${secoes.length} seções buscadas da API`, 'success');

            // Salvar seções no banco
            UI.log('💾 Salvando seções no banco...', 'info');
            await this.salvarNoBanco('secoes', secoes);
            UI.log(`✅ ${secoes.length} seções salvas no banco`, 'success');

            // 2. Grupos
            UI.atualizarStatusImportacao(card, 'loading', 'Buscando grupos...');
            const grupos = await API.buscarGrupos((total) => {
                UI.log(`   📄 Grupos: ${total} registros`, 'info');
            });
            UI.log(`✅ ${grupos.length} grupos buscados da API`, 'success');

            // Salvar grupos no banco
            UI.log('💾 Salvando grupos no banco...', 'info');
            await this.salvarNoBanco('grupos', grupos);
            UI.log(`✅ ${grupos.length} grupos salvos no banco`, 'success');

            // 3. Subgrupos
            UI.atualizarStatusImportacao(card, 'loading', 'Buscando subgrupos...');
            const subgrupos = await API.buscarSubgrupos((total) => {
                UI.log(`   📄 Subgrupos: ${total} registros`, 'info');
            });
            UI.log(`✅ ${subgrupos.length} subgrupos buscados da API`, 'success');

            // Salvar subgrupos no banco
            UI.log('💾 Salvando subgrupos no banco...', 'info');
            await this.salvarNoBanco('subgrupos', subgrupos);
            UI.log(`✅ ${subgrupos.length} subgrupos salvos no banco`, 'success');

            const total = secoes.length + grupos.length + subgrupos.length;
            UI.atualizarStatusImportacao(card, 'success', `${total} registros`);
            
            // Atualizar estatísticas do banco
            await this.atualizarEstatisticasDoBanco();

            return { secoes, grupos, subgrupos };
        } catch (error) {
            UI.log(`❌ Erro ao importar hierarquia: ${error.message}`, 'error');
            UI.atualizarStatusImportacao(card, 'error', error.message);
            throw error;
        }
    },

    /**
     * Importar marcas
     */
    async importarMarcas(card) {
        try {
            UI.log('🏷️  Iniciando importação de marcas...', 'info');
            UI.atualizarStatusImportacao(card, 'loading');

            const marcas = await API.buscarMarcas((total) => {
                UI.log(`   📄 Marcas: ${total} registros`, 'info');
                const percentual = Math.min(Math.floor((total / 500) * 100), 99);
                UI.atualizarStatusImportacao(card, 'progress', percentual);
            });

            UI.log(`✅ ${marcas.length} marcas buscadas da API`, 'success');

            // Salvar marcas no banco
            UI.log('💾 Salvando marcas no banco...', 'info');
            await this.salvarNoBanco('marcas', marcas);
            UI.log(`✅ ${marcas.length} marcas salvas no banco`, 'success');

            UI.atualizarStatusImportacao(card, 'success', `${marcas.length} registros`);
            
            // Atualizar estatísticas do banco
            await this.atualizarEstatisticasDoBanco();

            return marcas;
        } catch (error) {
            UI.log(`❌ Erro ao importar marcas: ${error.message}`, 'error');
            UI.atualizarStatusImportacao(card, 'error', error.message);
            throw error;
        }
    },

    /**
     * Importar produtos
     */
    async importarProdutos(card) {
        try {
            UI.log('📦 Iniciando importação de produtos...', 'info');
            UI.atualizarStatusImportacao(card, 'loading');

            const produtos = await API.buscarProdutos((total) => {
                UI.log(`   📄 Produtos: ${total} registros`, 'info');
                const percentual = Math.min(Math.floor((total / 1000) * 100), 99);
                UI.atualizarStatusImportacao(card, 'progress', percentual);
            });

            UI.log(`✅ ${produtos.length} produtos buscados da API`, 'success');

            // TODO: Implementar salvamento de produtos (estrutura mais complexa)
            UI.log(`⚠️  Salvamento de produtos será implementado em breve`, 'info');

            UI.atualizarStatusImportacao(card, 'success', `${produtos.length} registros`);
            UI.animarContador('statProdutos', produtos.length);

            return produtos;
        } catch (error) {
            UI.log(`❌ Erro ao importar produtos: ${error.message}`, 'error');
            UI.atualizarStatusImportacao(card, 'error', error.message);
            throw error;
        }
    },

    /**
     * Importar clientes
     */
    async importarClientes(card) {
        try {
            UI.log('👥 Iniciando importação de clientes...', 'info');
            UI.atualizarStatusImportacao(card, 'loading');

            const clientes = await API.buscarClientes((total) => {
                UI.log(`   📄 Clientes: ${total} registros`, 'info');
                const percentual = Math.min(Math.floor((total / 500) * 100), 99);
                UI.atualizarStatusImportacao(card, 'progress', percentual);
            });

            UI.log(`✅ ${clientes.length} clientes buscados da API`, 'success');

            // TODO: Implementar salvamento de clientes
            UI.log(`⚠️  Salvamento de clientes será implementado em breve`, 'info');

            UI.atualizarStatusImportacao(card, 'success', `${clientes.length} registros`);
            UI.animarContador('statClientes', clientes.length);

            return clientes;
        } catch (error) {
            UI.log(`❌ Erro ao importar clientes: ${error.message}`, 'error');
            UI.atualizarStatusImportacao(card, 'error', error.message);
            throw error;
        }
    },

    /**
     * Importar fornecedores
     */
    async importarFornecedores(card) {
        try {
            UI.log('🏢 Iniciando importação de fornecedores...', 'info');
            UI.atualizarStatusImportacao(card, 'loading');

            const fornecedores = await API.buscarFornecedores((total) => {
                UI.log(`   📄 Fornecedores: ${total} registros`, 'info');
                const percentual = Math.min(Math.floor((total / 200) * 100), 99);
                UI.atualizarStatusImportacao(card, 'progress', percentual);
            });

            UI.log(`✅ ${fornecedores.length} fornecedores buscados da API`, 'success');

            // TODO: Implementar salvamento de fornecedores
            UI.log(`⚠️  Salvamento de fornecedores será implementado em breve`, 'info');

            UI.atualizarStatusImportacao(card, 'success', `${fornecedores.length} registros`);
            UI.animarContador('statFornecedores', fornecedores.length);

            return fornecedores;
        } catch (error) {
            UI.log(`❌ Erro ao importar fornecedores: ${error.message}`, 'error');
            UI.atualizarStatusImportacao(card, 'error', error.message);
            throw error;
        }
    },

    /**
     * Importar categorias
     */
    async importarCategorias(card) {
        try {
            UI.log('💰 Iniciando importação de categorias...', 'info');
            UI.atualizarStatusImportacao(card, 'loading');

            const categorias = await API.buscarCategorias((total) => {
                UI.log(`   📄 Categorias: ${total} registros`, 'info');
                const percentual = Math.min(Math.floor((total / 100) * 100), 99);
                UI.atualizarStatusImportacao(card, 'progress', percentual);
            });

            UI.log(`✅ ${categorias.length} categorias buscadas da API`, 'success');

            // TODO: Implementar salvamento de categorias
            UI.log(`⚠️  Salvamento de categorias será implementado em breve`, 'info');

            UI.atualizarStatusImportacao(card, 'success', `${categorias.length} registros`);

            return categorias;
        } catch (error) {
            UI.log(`❌ Erro ao importar categorias: ${error.message}`, 'error');
            UI.atualizarStatusImportacao(card, 'error', error.message);
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
                UI.animarContador('statSecoes', stats.secoes);
                UI.animarContador('statGrupos', stats.grupos);
                UI.animarContador('statMarcas', stats.marcas);
                UI.animarContador('statProdutos', stats.produtos);
                UI.animarContador('statClientes', stats.clientes);
                UI.animarContador('statFornecedores', stats.fornecedores);
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
            
            // 1. Hierarquia (com gravação no banco)
            await this.importarHierarquia(cards[0]);
            
            // 2. Marcas (com gravação no banco)
            await this.importarMarcas(cards[1]);
            
            // 3. Produtos (apenas busca por enquanto)
            await this.importarProdutos(cards[2]);
            
            // 4. Clientes (apenas busca por enquanto)
            await this.importarClientes(cards[3]);
            
            // 5. Fornecedores (apenas busca por enquanto)
            await this.importarFornecedores(cards[4]);
            
            // 6. Categorias (apenas busca por enquanto)
            await this.importarCategorias(cards[5]);

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