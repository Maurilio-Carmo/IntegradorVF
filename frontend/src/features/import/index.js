// frontend/src/features/import/index.js

/**
 * Módulo de Importação Principal
 * Agrupa todos os importadores e expõe métodos públicos
 */

import { ProdutoImporter }      from './importers/produto-importer.js';
import { PessoaImporter }       from './importers/pessoa-importer.js';
import { FinanceiroImporter }   from './importers/financeiro-importer.js';
import { PDVImporter }          from './importers/pdv-importer.js';
import { FiscalImporter }       from './importers/fiscal-importer.js';
import { EstoqueImporter }      from './importers/estoque-importer.js';
import { MercadologiaImporter } from './importers/arvore-importer.js';
import DatabaseClient           from '../../services/database/db-client.js';
import UI                       from '../../ui/ui.js';

const produtoImporter      = new ProdutoImporter();
const pessoaImporter       = new PessoaImporter();
const financeiroImporter   = new FinanceiroImporter();
const pdvImporter          = new PDVImporter();
const fiscalImporter       = new FiscalImporter();
const estoqueImporter      = new EstoqueImporter();
const mercadologiaImporter = new MercadologiaImporter();
const db                   = new DatabaseClient();

const Importacao = {

    // ESTATÍSTICAS

    async atualizarEstatisticas() {
        try {
            const stats = await db.getStatistics();
            if (stats) UI.statistics.update(stats);
            return stats;
        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas:', error);
        }
    },

    // PRODUTO — ÁRVORE MERCADOLÓGICA

    async importarMercadologia(uiElement) {
        const result = await mercadologiaImporter.importarMercadologia(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarMarcas(uiElement) {
        const result = await produtoImporter.importarMarcas(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarFamilias(uiElement) {
        const result = await produtoImporter.importarFamilias(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarProdutos(uiElement) {
        const result = await produtoImporter.importarProdutos(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    // FINANCEIRO

    async importarCategorias(uiElement) {
        const result = await financeiroImporter.importarCategorias(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarAgentes(uiElement) {
        const result = await financeiroImporter.importarAgentes(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarContasCorrentes(uiElement) {
        const result = await financeiroImporter.importarContasCorrentes(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarEspeciesDocumento(uiElement) {
        const result = await financeiroImporter.importarEspeciesDocumento(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarHistoricoPadrao(uiElement) {
        const result = await financeiroImporter.importarHistoricoPadrao(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    // PDV / FRENTE DE LOJA

    async importarCaixas(uiElement) {
        const result = await pdvImporter.importarCaixas(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarPagamentosPDV(uiElement) {
        const result = await pdvImporter.importarPagamentosPDV(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarRecebimentosPDV(uiElement) {
        const result = await pdvImporter.importarRecebimentosPDV(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarMotivosDesconto(uiElement) {
        const result = await pdvImporter.importarMotivosDesconto(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarMotivosDevolucao(uiElement) {
        const result = await pdvImporter.importarMotivosDevolucao(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarMotivosCancelamento(uiElement) {
        const result = await pdvImporter.importarMotivosCancelamento(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    // ESTOQUE

    async importarLocalEstoque(uiElement) {
        const result = await estoqueImporter.importarLocalEstoque(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarTiposAjustes(uiElement) {
        const result = await estoqueImporter.importarTiposAjustes(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    // FISCAL

    async importarImpostosFederais(uiElement) {
        const result = await fiscalImporter.importarImpostosFederais(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarRegimeTributario(uiElement) {
        const result = await fiscalImporter.importarRegimeTributario(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarSituacoesFiscais(uiElement) {
        const result = await fiscalImporter.importarSituacoesFiscais(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarTiposOperacoes(uiElement) {
        const result = await fiscalImporter.importarTiposOperacoes(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarTabelasTributariasEntrada(uiElement) {
        const result = await fiscalImporter.importarTabelasTributariasEntrada(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarTabelasTributariasSaida(uiElement) {
        const result = await fiscalImporter.importarTabelasTributariasSaida(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    /**
     * Importar tabelas tributárias (entrada + saída)
     */
    async importarTabelasTributarias(uiElement) {
        UI.log('📋 Importando tabelas tributárias (entrada + saída)...', 'info');
        const entrada = await fiscalImporter.importarTabelasTributariasEntrada(uiElement);
        const saida   = await fiscalImporter.importarTabelasTributariasSaida(uiElement);
        await this.atualizarEstatisticas();
        return {
            success: entrada.success && saida.success,
            entrada,
            saida
        };
    },

    // PESSOA

    async importarLojas(uiElement) {
        const result = await pessoaImporter.importarLojas(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarClientes(uiElement) {
        const result = await pessoaImporter.importarClientes(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },

    async importarFornecedores(uiElement) {
        const result = await pessoaImporter.importarFornecedores(uiElement);
        await this.atualizarEstatisticas();
        return result;
    },
};

export default Importacao;