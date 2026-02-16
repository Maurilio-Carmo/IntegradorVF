// frontend/src/features/import/index.js

/**
 * Módulo de Importação Principal
 * Agrupa todos os importadores e expõe métodos públicos
 */

import { ProdutoImporter } from './importers.js';
import { PessoaImporter } from './importers.js';
import { FinanceiroImporter } from './importers.js';
import { PDVImporter } from './importers.js';
import { FiscalImporter } from './importers.js';
import { EstoqueImporter } from './importers.js';
import { ArvoreMercadologicaImporter } from './arvore-mercadologica-importer.js';

// Instanciar importadores
const produtoImporter = new ProdutoImporter();
const pessoaImporter = new PessoaImporter();
const financeiroImporter = new FinanceiroImporter();
const pdvImporter = new PDVImporter();
const fiscalImporter = new FiscalImporter();
const estoqueImporter = new EstoqueImporter();
const arvoreMercadologicaImporter = new ArvoreMercadologicaImporter();

/**
 * API Pública de Importação
 * Cada método corresponde a uma ação do usuário
 */
const Importacao = {
    
    // ========================================
    // PRODUTOS 
    // ========================================

    async importarArvoreMercadologica(uiElement) {
        return await arvoreMercadologicaImporter.importarArvoreMercadologica(uiElement);
    },

    async importarMarcas(uiElement) {
        return await produtoImporter.importarMarcas(uiElement);
    },

    async importarFamilias(uiElement) {
        return await produtoImporter.importarFamilias(uiElement);
    },

    async importarProdutos(uiElement) {
        return await produtoImporter.importarProdutos(uiElement);
    },

    // ========================================
    // PESSOAS
    // ========================================
    
    async importarClientes(uiElement) {
        return await pessoaImporter.importarClientes(uiElement);
    },

    async importarFornecedores(uiElement) {
        return await pessoaImporter.importarFornecedores(uiElement);
    },

    async importarLojas(uiElement) {
        return await pessoaImporter.importarLojas(uiElement);
    },

    // ========================================
    // FINANCEIRO
    // ========================================
    
    async importarCategorias(uiElement) {
        return await financeiroImporter.importarCategorias(uiElement);
    },

    async importarAgentes(uiElement) {
        return await financeiroImporter.importarAgentes(uiElement);
    },

    async importarContasCorrentes(uiElement) {
        return await financeiroImporter.importarContasCorrentes(uiElement);
    },

    async importarEspeciesDocumento(uiElement) {
        return await financeiroImporter.importarEspeciesDocumento(uiElement);
    },

    async importarHistoricoPadrao(uiElement) {
        return await financeiroImporter.importarHistoricoPadrao(uiElement);
    },

    async importarFormasPagamento(uiElement) {
        return await financeiroImporter.importarFormasPagamento(uiElement);
    },

    // ========================================
    // PDV / FRENTE DE LOJA
    // ========================================
    
    async importarCaixas(uiElement) {
        return await pdvImporter.importarCaixas(uiElement);
    },

    async importarMotivosCancelamento(uiElement) {
        return await pdvImporter.importarMotivosCancelamento(uiElement);
    },

    async importarMotivosDesconto(uiElement) {
        return await pdvImporter.importarMotivosDesconto(uiElement);
    },

    async importarMotivosDevolucao(uiElement) {
        return await pdvImporter.importarMotivosDevolucao(uiElement);
    },

    async importarPagamentosPDV(uiElement) {
        return await pdvImporter.importarPagamentosPDV(uiElement);
    },

    async importarRecebimentosPDV(uiElement) {
        return await pdvImporter.importarRecebimentosPDV(uiElement);
    },

    // ========================================
    // FISCAL
    // ========================================
    
    async importarImpostosFederais(uiElement) {
        return await fiscalImporter.importarImpostosFederais(uiElement);
    },

    async importarRegimeTributario(uiElement) {
        return await fiscalImporter.importarRegimeTributario(uiElement);
    },

    async importarSituacoesFiscais(uiElement) {
        return await fiscalImporter.importarSituacoesFiscais(uiElement);
    },

    async importarTabelasTributariasEntrada(uiElement) {
        return await fiscalImporter.importarTabelasTributariasEntrada(uiElement);
    },

    async importarTabelasTributariasSaida(uiElement) {
        return await fiscalImporter.importarTabelasTributariasSaida(uiElement);
    },

    async importarTiposOperacoes(uiElement) {
        return await fiscalImporter.importarTiposOperacoes(uiElement);
    },

    // ========================================
    // ESTOQUE
    // ========================================
    
    async importarLocalEstoque(uiElement) {
        return await estoqueImporter.importarLocalEstoque(uiElement);
    },

    async importarTiposAjustes(uiElement) {
        return await estoqueImporter.importarTiposAjustes(uiElement);
    }
};

export default Importacao;