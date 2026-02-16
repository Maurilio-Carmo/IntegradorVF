// frontend/src/features/import/index.js

/**
 * Módulo de Importação Principal (Modularizado)
 * Agrega todos os importadores e mantém compatibilidade com código legado
 */

import {
    ProdutoImporter,
    PessoaImporter,
    FinanceiroImporter,
    PDVImporter,
    FiscalImporter,
    EstoqueImporter
} from './importers.js';
import { ImportBase } from './import-base.js';
import DatabaseClient from '../../services/database/db-client.js';

/**
 * Gerenciador de Importações
 */
class ImportManager {
    constructor() {
        // Criar instâncias dos importadores
        this.produto = new ProdutoImporter();
        this.pessoa = new PessoaImporter();
        this.financeiro = new FinanceiroImporter();
        this.pdv = new PDVImporter();
        this.fiscal = new FiscalImporter();
        this.estoque = new EstoqueImporter();
        
        // Cliente de banco
        this.db = new DatabaseClient();
    }

    // ========================================
    // MÉTODOS LEGADOS (compatibilidade)
    // ========================================

    // Produtos
    async importarSecoes(card) {
        return await this.produto.importarSecoes(card);
    }

    async importarGrupos(card) {
        return await this.produto.importarGrupos(card);
    }

    async importarSubgrupos(card) {
        return await this.produto.importarSubgrupos(card);
    }

    async importarMarcas(card) {
        return await this.produto.importarMarcas(card);
    }

    async importarFamilias(card) {
        return await this.produto.importarFamilias(card);
    }

    async importarProdutos(card) {
        return await this.produto.importarProdutos(card);
    }

    // Pessoas
    async importarClientes(card) {
        return await this.pessoa.importarClientes(card);
    }

    async importarFornecedores(card) {
        return await this.pessoa.importarFornecedores(card);
    }

    async importarLojas(card) {
        return await this.pessoa.importarLojas(card);
    }

    // Financeiro
    async importarCategorias(card) {
        return await this.financeiro.importarCategorias(card);
    }

    async importarAgentes(card) {
        return await this.financeiro.importarAgentes(card);
    }

    async importarContasCorrentes(card) {
        return await this.financeiro.importarContasCorrentes(card);
    }

    async importarEspeciesDocumento(card) {
        return await this.financeiro.importarEspeciesDocumento(card);
    }

    async importarHistoricoPadrao(card) {
        return await this.financeiro.importarHistoricoPadrao(card);
    }

    // PDV
    async importarCaixas(card) {
        return await this.pdv.importarCaixas(card);
    }

    async importarMotivosCancelamento(card) {
        return await this.pdv.importarMotivosCancelamento(card);
    }

    async importarMotivosDesconto(card) {
        return await this.pdv.importarMotivosDesconto(card);
    }

    async importarMotivosDevolucao(card) {
        return await this.pdv.importarMotivosDevolucao(card);
    }

    async importarPagamentosPDV(card) {
        return await this.pdv.importarPagamentosPDV(card);
    }

    async importarRecebimentosPDV(card) {
        return await this.pdv.importarRecebimentosPDV(card);
    }

    // Fiscal
    async importarImpostosFederais(card) {
        return await this.fiscal.importarImpostosFederais(card);
    }

    async importarRegimeTributario(card) {
        return await this.fiscal.importarRegimeTributario(card);
    }

    async importarSituacoesFiscais(card) {
        return await this.fiscal.importarSituacoesFiscais(card);
    }

    async importarTabelasTributariasEntrada(card) {
        return await this.fiscal.importarTabelasTributariasEntrada(card);
    }

    async importarTabelasTributariasSaida(card) {
        return await this.fiscal.importarTabelasTributariasSaida(card);
    }

    async importarTiposOperacoes(card) {
        return await this.fiscal.importarTiposOperacoes(card);
    }

    // Estoque
    async importarLocalEstoque(card) {
        return await this.estoque.importarLocalEstoque(card);
    }

    async importarTiposAjustes(card) {
        return await this.estoque.importarTiposAjustes(card);
    }

    // ========================================
    // MÉTODOS UTILITÁRIOS
    // ========================================

    /**
     * Atualizar estatísticas do banco
     */
    async atualizarEstatisticas() {
        return await this.produto.updateStatistics();
    }

    /**
     * Buscar estatísticas
     */
    async buscarEstatisticas() {
        return await this.db.getStatistics();
    }

    /**
     * Salvar no banco (método legado)
     */
    async salvarNoBanco(endpoint, dados) {
        return await this.db.save(endpoint, dados);
    }

    /**
     * Importar entidade (método legado genérico)
     */
    async importarEntidade(config) {
        const base = new ImportBase();
        return await base.execute({
            name: config.nome,
            endpoint: config.endpoint,
            apiMethod: config.metodoAPI,
            uiElement: config.card,
            estimate: config.estimativa
        });
    }
}

// Criar instância singleton
const Importacao = new ImportManager();

// Exportar instância e classes
export { ImportManager, Importacao };
export default Importacao;