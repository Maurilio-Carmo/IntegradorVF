// frontend/src/services/api/modules.js

import { APIBase } from './api-base.js';

// PESSOA 
export class PessoaAPI extends APIBase {
    async buscarLojas(onProgress) {
        return await this.fetchAll('pessoa/lojas', onProgress);
    }

    async buscarClientes(onProgress) {
        return await this.fetchAll('pessoa/clientes', onProgress);
    }

    async buscarFornecedores(onProgress) {
        return await this.fetchAll('pessoa/fornecedores', onProgress);
    }

    async buscarLojaPorId(id) {
        return await this.http.get(`administracao/lojas/${id}`);
    }

    async buscarClientePorId(id) {
        return await this.http.get(`pessoa/clientes/${id}`);
    }

    async buscarFornecedorPorId(id) {
        return await this.http.get(`pessoa/fornecedores/${id}`);
    }
}

// FINANCEIRO API
export class FinanceiroAPI extends APIBase {
    async buscarCategorias(onProgress) {
        return await this.fetchAll('financeiro/categorias', onProgress);
    }

    async buscarAgentes(onProgress) {
        return await this.fetchAll('pessoa/agentes-financeiros', onProgress);
    }

    async buscarContasCorrentes(onProgress) {
        return await this.fetchAll('financeiro/contas-correntes', onProgress);
    }

    async buscarEspeciesDocumento(onProgress) {
        return await this.fetchAll('financeiro/especies-documentos', onProgress);
    }

    async buscarHistoricoPadrao(onProgress) {
        return await this.fetchAll('financeiro/historicos-padrao', onProgress);
    }
}

// PDV API
export class PDVAPI extends APIBase {
    async buscarPagamentosPDV(onProgress) {
        return await this.fetchAll('financeiro/pagamentos-pdv', onProgress);
    }

    async buscarRecebimentosPDV(onProgress) {
        return await this.fetchAll('financeiro/recebimentos-pdv', onProgress);
    }

    async buscarMotivosCancelamento(onProgress) {
        return await this.fetchAll('motivos-cancelamento', onProgress);
    }

    async buscarMotivosDesconto(onProgress) {
        return await this.fetchAll('motivos-desconto', onProgress);
    }

    async buscarMotivosDevolucao(onProgress) {
        return await this.fetchAll('financeiro/motivos-devolucao', onProgress);
    }
}

// FISCAL API
export class FiscalAPI extends APIBase {
    async buscarImpostosFederais(onProgress) {
        return await this.fetchAll('fiscal/impostos-federais', onProgress);
    }

    async buscarRegimeTributario(onProgress) {
        return await this.fetchAll('fiscal/regime-estadual-tributario', onProgress);
    }

    async buscarSituacoesFiscais(onProgress) {
        return await this.fetchAll('fiscal/situacoes', onProgress);
    }

    async buscarTiposOperacoes(onProgress) {
        return await this.fetchAll('fiscal/operacoes', onProgress);
    }

    async buscarTabelasTributarias(onProgress) {
        return await this.fetchAll('fiscal/tabelas-tributarias', onProgress);
    }
}

// ESTOQUE API
export class EstoqueAPI extends APIBase {
    async buscarLocalEstoque(onProgress) {
        return await this.fetchAll('estoque/locais', onProgress);
    }

    async buscarTiposAjustes(onProgress) {
        return await this.fetchAll('estoque/tipos-ajuste', onProgress);
    }
}

// ADMINISTRAÇÃO API
export class AdministracaoAPI extends APIBase {
    async buscarLicenciamento() {
        return await this.http.get('administracao/licenciamento');
    }

}