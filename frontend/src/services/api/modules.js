// frontend/src/services/api/modules.js

/**
 * Módulos de API por Domínio
 * Organização modular dos endpoints da API Varejo Fácil
 */

import { APIBase } from './api-base.js';

// ========================================
// PESSOA API
// ========================================
export class PessoaAPI extends APIBase {
    async buscarClientes(onProgress) {
        return await this.fetchAll('pessoa/clientes', onProgress);
    }

    async buscarFornecedores(onProgress) {
        return await this.fetchAll('pessoa/fornecedores', onProgress);
    }

    async buscarClientePorId(id) {
        return await this.http.get(`pessoa/clientes/${id}`);
    }

    async buscarFornecedorPorId(id) {
        return await this.http.get(`pessoa/fornecedores/${id}`);
    }
}

// ========================================
// FINANCEIRO API
// ========================================
export class FinanceiroAPI extends APIBase {
    async buscarCategorias(onProgress) {
        return await this.fetchAll('financeiro/categorias', onProgress);
    }

    async buscarAgentes(onProgress) {
        return await this.fetchAll('financeiro/agentes-financeiros', onProgress);
    }

    async buscarContasCorrentes(onProgress) {
        return await this.fetchAll('financeiro/contas-correntes', onProgress);
    }

    async buscarEspeciesDocumento(onProgress) {
        return await this.fetchAll('financeiro/especies-documento', onProgress);
    }

    async buscarHistoricoPadrao(onProgress) {
        return await this.fetchAll('financeiro/historico-padrao', onProgress);
    }
}

// ========================================
// PDV API
// ========================================
export class PDVAPI extends APIBase {
    async buscarCaixas(onProgress) {
        return await this.fetchAll('pdv/caixas', onProgress);
    }

    async buscarMotivosCancelamento(onProgress) {
        return await this.fetchAll('pdv/motivos-cancelamento', onProgress);
    }

    async buscarMotivosDesconto(onProgress) {
        return await this.fetchAll('pdv/motivos-desconto', onProgress);
    }

    async buscarMotivosDevolucao(onProgress) {
        return await this.fetchAll('pdv/motivos-devolucao', onProgress);
    }

    async buscarPagamentosPDV(onProgress) {
        return await this.fetchAll('pdv/formas-pagamento', onProgress);
    }

    async buscarRecebimentosPDV(onProgress) {
        return await this.fetchAll('pdv/formas-recebimento', onProgress);
    }
}

// ========================================
// FISCAL API
// ========================================
export class FiscalAPI extends APIBase {
    async buscarImpostosFederais(onProgress) {
        return await this.fetchAll('fiscal/impostos-federais', onProgress);
    }

    async buscarRegimeTributario(onProgress) {
        return await this.fetchAll('fiscal/regimes-tributarios', onProgress);
    }

    async buscarSituacoesFiscais(onProgress) {
        return await this.fetchAll('fiscal/situacoes-fiscais', onProgress);
    }

    async buscarTabelasTributariasEntrada(onProgress) {
        return await this.fetchAll('fiscal/tabelas-tributarias-entrada', onProgress);
    }

    async buscarTabelasTributariasSaida(onProgress) {
        return await this.fetchAll('fiscal/tabelas-tributarias-saida', onProgress);
    }

    async buscarTiposOperacoes(onProgress) {
        return await this.fetchAll('fiscal/tipos-operacoes', onProgress);
    }
}

// ========================================
// ESTOQUE API
// ========================================
export class EstoqueAPI extends APIBase {
    async buscarLocalEstoque(onProgress) {
        return await this.fetchAll('estoque/locais-estoque', onProgress);
    }

    async buscarTiposAjustes(onProgress) {
        return await this.fetchAll('estoque/tipos-ajustes', onProgress);
    }
}

// ========================================
// ADMINISTRAÇÃO API
// ========================================
export class AdministracaoAPI extends APIBase {
    async buscarLojas(onProgress) {
        return await this.fetchAll('administracao/lojas', onProgress);
    }

    async buscarLicenciamento() {
        return await this.http.get('administracao/licenciamento');
    }

    async buscarLojaPorId(id) {
        return await this.http.get(`administracao/lojas/${id}`);
    }
}