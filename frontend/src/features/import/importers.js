// frontend/src/features/import/importers.js

/**
 * Importadores por Domínio
 * Cada classe gerencia importações de um domínio específico
 */

import { ImportBase } from './import-base.js';
import API from '../../services/api/index.js';

// ========================================
// IMPORTADOR DE PRODUTOS
// ========================================
export class ProdutoImporter extends ImportBase {
    async importarSecoes(uiElement) {
        return await this.execute({
            name: 'seções',
            endpoint: 'secoes',
            apiMethod: API.produto.buscarSecoes.bind(API.produto),
            uiElement,
            estimate: 100
        });
    }

    async importarGrupos(uiElement) {
        return await this.execute({
            name: 'grupos',
            endpoint: 'grupos',
            apiMethod: API.produto.buscarGrupos.bind(API.produto),
            uiElement,
            estimate: 500
        });
    }

    async importarSubgrupos(uiElement) {
        return await this.execute({
            name: 'subgrupos',
            endpoint: 'subgrupos',
            apiMethod: API.produto.buscarSubgrupos.bind(API.produto),
            uiElement,
            estimate: 1000
        });
    }

    async importarMarcas(uiElement) {
        return await this.execute({
            name: 'marcas',
            endpoint: 'marcas',
            apiMethod: API.produto.buscarMarcas.bind(API.produto),
            uiElement,
            estimate: 500
        });
    }

    async importarFamilias(uiElement) {
        return await this.execute({
            name: 'famílias',
            endpoint: 'familias',
            apiMethod: API.produto.buscarFamilias.bind(API.produto),
            uiElement,
            estimate: 200
        });
    }

    async importarProdutos(uiElement) {
        return await this.execute({
            name: 'produtos',
            endpoint: 'produtos',
            apiMethod: API.produto.buscarProdutos.bind(API.produto),
            uiElement,
            estimate: 5000
        });
    }
}

// ========================================
// IMPORTADOR DE PESSOAS
// ========================================
export class PessoaImporter extends ImportBase {
    async importarClientes(uiElement) {
        return await this.execute({
            name: 'clientes',
            endpoint: 'clientes',
            apiMethod: API.pessoa.buscarClientes.bind(API.pessoa),
            uiElement,
            estimate: 1000
        });
    }

    async importarFornecedores(uiElement) {
        return await this.execute({
            name: 'fornecedores',
            endpoint: 'fornecedores',
            apiMethod: API.pessoa.buscarFornecedores.bind(API.pessoa),
            uiElement,
            estimate: 300
        });
    }

    async importarLojas(uiElement) {
        return await this.execute({
            name: 'lojas',
            endpoint: 'lojas',
            apiMethod: API.administracao.buscarLojas.bind(API.administracao),
            uiElement,
            estimate: 50
        });
    }
}

// ========================================
// IMPORTADOR FINANCEIRO
// ========================================
export class FinanceiroImporter extends ImportBase {
    async importarCategorias(uiElement) {
        return await this.execute({
            name: 'categorias',
            endpoint: 'categorias',
            apiMethod: API.financeiro.buscarCategorias.bind(API.financeiro),
            uiElement,
            estimate: 200
        });
    }

    async importarAgentes(uiElement) {
        return await this.execute({
            name: 'agentes',
            endpoint: 'agentes',
            apiMethod: API.financeiro.buscarAgentes.bind(API.financeiro),
            uiElement,
            estimate: 100
        });
    }

    async importarContasCorrentes(uiElement) {
        return await this.execute({
            name: 'contas correntes',
            endpoint: 'contas-correntes',
            apiMethod: API.financeiro.buscarContasCorrentes.bind(API.financeiro),
            uiElement,
            estimate: 100
        });
    }

    async importarEspeciesDocumento(uiElement) {
        return await this.execute({
            name: 'espécies de documento',
            endpoint: 'especies-documento',
            apiMethod: API.financeiro.buscarEspeciesDocumento.bind(API.financeiro),
            uiElement,
            estimate: 50
        });
    }

    async importarHistoricoPadrao(uiElement) {
        return await this.execute({
            name: 'histórico padrão',
            endpoint: 'historico-padrao',
            apiMethod: API.financeiro.buscarHistoricoPadrao.bind(API.financeiro),
            uiElement,
            estimate: 100
        });
    }
}

// ========================================
// IMPORTADOR PDV
// ========================================
export class PDVImporter extends ImportBase {
    async importarCaixas(uiElement) {
        return await this.execute({
            name: 'caixas',
            endpoint: 'caixas',
            apiMethod: API.pdv.buscarCaixas.bind(API.pdv),
            uiElement,
            estimate: 100
        });
    }

    async importarMotivosCancelamento(uiElement) {
        return await this.execute({
            name: 'motivos de cancelamento',
            endpoint: 'motivos-cancelamento',
            apiMethod: API.pdv.buscarMotivosCancelamento.bind(API.pdv),
            uiElement,
            estimate: 50
        });
    }

    async importarMotivosDesconto(uiElement) {
        return await this.execute({
            name: 'motivos de desconto',
            endpoint: 'motivos-desconto',
            apiMethod: API.pdv.buscarMotivosDesconto.bind(API.pdv),
            uiElement,
            estimate: 50
        });
    }

    async importarMotivosDevolucao(uiElement) {
        return await this.execute({
            name: 'motivos de devolução',
            endpoint: 'motivos-devolucao',
            apiMethod: API.pdv.buscarMotivosDevolucao.bind(API.pdv),
            uiElement,
            estimate: 50
        });
    }

    async importarPagamentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de pagamento',
            endpoint: 'pagamentos-pdv',
            apiMethod: API.pdv.buscarPagamentosPDV.bind(API.pdv),
            uiElement,
            estimate: 50
        });
    }

    async importarRecebimentosPDV(uiElement) {
        return await this.execute({
            name: 'formas de recebimento',
            endpoint: 'recebimentos-pdv',
            apiMethod: API.pdv.buscarRecebimentosPDV.bind(API.pdv),
            uiElement,
            estimate: 50
        });
    }
}

// ========================================
// IMPORTADOR FISCAL
// ========================================
export class FiscalImporter extends ImportBase {
    async importarImpostosFederais(uiElement) {
        return await this.execute({
            name: 'impostos federais',
            endpoint: 'impostos-federais',
            apiMethod: API.fiscal.buscarImpostosFederais.bind(API.fiscal),
            uiElement,
            estimate: 50
        });
    }

    async importarRegimeTributario(uiElement) {
        return await this.execute({
            name: 'regime tributário',
            endpoint: 'regime-tributario',
            apiMethod: API.fiscal.buscarRegimeTributario.bind(API.fiscal),
            uiElement,
            estimate: 50
        });
    }

    async importarSituacoesFiscais(uiElement) {
        return await this.execute({
            name: 'situações fiscais',
            endpoint: 'situacoes-fiscais',
            apiMethod: API.fiscal.buscarSituacoesFiscais.bind(API.fiscal),
            uiElement,
            estimate: 100
        });
    }

    async importarTabelasTributariasEntrada(uiElement) {
        return await this.execute({
            name: 'tabelas tributárias de entrada',
            endpoint: 'tabelas-tributarias-entrada',
            apiMethod: API.fiscal.buscarTabelasTributariasEntrada.bind(API.fiscal),
            uiElement,
            estimate: 100
        });
    }

    async importarTabelasTributariasSaida(uiElement) {
        return await this.execute({
            name: 'tabelas tributárias de saída',
            endpoint: 'tabelas-tributarias-saida',
            apiMethod: API.fiscal.buscarTabelasTributariasSaida.bind(API.fiscal),
            uiElement,
            estimate: 100
        });
    }

    async importarTiposOperacoes(uiElement) {
        return await this.execute({
            name: 'tipos de operações',
            endpoint: 'tipos-operacoes',
            apiMethod: API.fiscal.buscarTiposOperacoes.bind(API.fiscal),
            uiElement,
            estimate: 100
        });
    }
}

// ========================================
// IMPORTADOR ESTOQUE
// ========================================
export class EstoqueImporter extends ImportBase {
    async importarLocalEstoque(uiElement) {
        return await this.execute({
            name: 'locais de estoque',
            endpoint: 'local-estoque',
            apiMethod: API.estoque.buscarLocalEstoque.bind(API.estoque),
            uiElement,
            estimate: 50
        });
    }

    async importarTiposAjustes(uiElement) {
        return await this.execute({
            name: 'tipos de ajustes',
            endpoint: 'tipos-ajustes',
            apiMethod: API.estoque.buscarTiposAjustes.bind(API.estoque),
            uiElement,
            estimate: 50
        });
    }
}