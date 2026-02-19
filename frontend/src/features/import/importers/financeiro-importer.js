// frontend/src/features/import/importers/financeiro-importer.js

/**
 * Importador Financeiro
 * Gerencia importações do domínio financeiro
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
export class FinanceiroImporter extends ImportBase {
    /**
     * Importar categorias financeiras
     */
    async importarCategorias(uiElement) {
        return await this.execute({
            name: 'categorias',
            endpoint: 'categorias',
            apiMethod: API.financeiro.buscarCategorias.bind(API.financeiro),
            uiElement,
        });
    }

    /**
     * Importar agentes financeiros
     */
    async importarAgentes(uiElement) {
        return await this.execute({
            name: 'agentes',
            endpoint: 'agentes',
            apiMethod: API.financeiro.buscarAgentes.bind(API.financeiro),
            uiElement,
        });
    }

    /**
     * Importar contas correntes
     */
    async importarContasCorrentes(uiElement) {
        return await this.execute({
            name: 'contas correntes',
            endpoint: 'contas-correntes',
            apiMethod: API.financeiro.buscarContasCorrentes.bind(API.financeiro),
            uiElement,
        });
    }

    /**
     * Importar espécies de documento
     */
    async importarEspeciesDocumento(uiElement) {
        return await this.execute({
            name: 'espécies de documento',
            endpoint: 'especies-documento',
            apiMethod: API.financeiro.buscarEspeciesDocumento.bind(API.financeiro),
            uiElement,
        });
    }

    /**
     * Importar histórico padrão
     */
    async importarHistoricoPadrao(uiElement) {
        return await this.execute({
            name: 'histórico padrão',
            endpoint: 'historico-padrao',
            apiMethod: API.financeiro.buscarHistoricoPadrao.bind(API.financeiro),
            uiElement,
        });
    }

    /**
     * Importar formas de pagamento
     */
    async importarFormasPagamento(uiElement) {
        return await this.execute({
            name: 'formas de pagamento',
            endpoint: 'formas-pagamento',
            apiMethod: API.financeiro.buscarFormasPagamento.bind(API.financeiro),
            uiElement,
        });
    }
}

export default FinanceiroImporter;