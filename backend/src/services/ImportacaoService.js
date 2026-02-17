// backend/src/services/ImportacaoService.js

/**
 * ImportacaoService — Orquestrador de Importação
 * Responsabilidade ÚNICA: receber dados da API e delegar para o repositório correto.
*/

const {
    Mercadologia,
    Produto,
    Financeiro,
    FrenteLoja,
    Estoque,
    Fiscal,
    Pessoa,
} = require('../modules/sqlite-repository/base-repository.js');

const dbSQLite = require('../config/database-sqlite.js');
const { escape } = require('node-firebird');

class ImportacaoService {

    // MERCADOLÓGICA

    static async importarSecoes(secoes) {
        return Mercadologia.importarSecoes(secoes);
    }

    static async importarGrupos(grupos) {
        return Mercadologia.importarGrupos(grupos);
    }

    static async importarSubgrupos(subgrupos) {
        return Mercadologia.importarSubgrupos(subgrupos);
    }

    // PRODUTOS

    static async importarMarcas(marcas) {
        return Produto.importarMarcas(marcas);
    }

    static async importarFamilias(familias) {
        return Produto.importarFamilias(familias);
    }

    /**
     * @param {Array}  produtos
     * @param {number} lojaId  - ID da loja para resolver estoque e regime fiscal
     */
    static async importarProdutos(produtos, lojaId) {
        return Produto.importarProdutos(produtos, lojaId);
    }

    // FINANCEIRO

    static async importarCategorias(categorias) {
        return Financeiro.importarCategorias(categorias);
    }

    static async importarAgentes(agentes) {
        return Financeiro.importarAgentes(agentes);
    }

    static async importarContasCorrentes(contas) {
        return Financeiro.importarContasCorrentes(contas);
    }

    static async importarEspeciesDocumento(especies) {
        return Financeiro.importarEspeciesDocumento(especies);
    }

    static async importarHistoricoPadrao(historicos) {
        return Financeiro.importarHistoricoPadrao(historicos);
    }

    // FRENTE DE LOJA  (PDV, TIPOS, MOTIVOS)

    static async importarCaixas(caixas) {
        return FrenteLoja.importarCaixas(caixas);
    }

    static async importarPagamentosPDV(pagamentos) {
        return FrenteLoja.importarPagamentosPDV(pagamentos);
    }

    static async importarRecebimentosPDV(recebimentos) {
        return FrenteLoja.importarRecebimentosPDV(recebimentos);
    }

    static async importarMotivosDesconto(motivos) {
        return FrenteLoja.importarMotivosDesconto(motivos);
    }

    static async importarMotivosDevolucao(motivos) {
        return FrenteLoja.importarMotivosDevolucao(motivos);
    }

    static async importarMotivosCancelamento(motivos) {
        return FrenteLoja.importarMotivosCancelamento(motivos);
    }

    // ESTOQUE

    static async importarLocalEstoque(locais) {
        return Estoque.importarLocalEstoque(locais);
    }

    static async importarTiposAjustes(tipos) {
        return Estoque.importarTiposAjustes(tipos);
    }

    // FISCAL / TRIBUTÁRIO

    static async importarRegimeTributario(regimes) {
        return Fiscal.importarRegimeTributario(regimes);
    }

    static async importarSituacoesFiscais(situacoes) {
        return Fiscal.importarSituacoesFiscais(situacoes);
    }

    static async importarTiposOperacoes(tipos) {
        return Fiscal.importarTiposOperacoes(tipos);
    }

    static async importarImpostosFederais(impostos) {
        return Fiscal.importarImpostosFederais(impostos);
    }

    static async importarTabelasTributariasEntrada(tabelas) {
        return Fiscal.importarTabelasTributariasEntrada(tabelas);
    }

    static async importarTabelasTributariasSaida(tabelas) {
        return Fiscal.importarTabelasTributariasSaida(tabelas);
    }

    // PESSOAS

    static async importarLojas(lojas) {
        return Pessoa.importarLojas(lojas);
    }

    static async importarClientes(clientes) {
        return Pessoa.importarClientes(clientes);
    }

    static async importarFornecedores(fornecedores) {
        return Pessoa.importarFornecedores(fornecedores);
    }

    // ESTATÍSTICAS

    static async obterEstatisticas() {
        try {
            dbSQLite.getConnection();

            // Lista de tabelas reais conforme IntegradorDB.sql
            const tabelas = [
                'secoes', 'grupos', 'subgrupos', 'marcas', 'familias',
                'produtos', 'clientes', 'fornecedores', 'lojas', 'caixas',
                'local_estoque', 'agentes', 'categorias', 'contas_correntes',
                'especies_documentos',          // ← nome correto com 's'
                'historico_padrao',
                'motivos_cancelamento', 'motivos_desconto', 'motivos_devolucao',
                'pagamentos_pdv', 'recebimentos_pdv',
                'impostos_federais', 'regime_tributario', 'situacoes_fiscais',
                'tabelas_tributarias_entrada', 'tabelas_tributarias_saida',
                'tipos_operacoes', 'tipos_ajustes',
            ];

            return tabelas.reduce((acc, tabela) => {
                acc[tabela] = dbSQLite.count(tabela);
                return acc;
            }, {});

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error.message);
            return {};
        }
    }
}

module.exports = ImportacaoService;