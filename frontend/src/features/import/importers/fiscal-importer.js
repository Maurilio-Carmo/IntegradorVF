// frontend/src/features/import/importers/fiscal-importer.js

/**
 * Importador Fiscal
 * Gerencia importações do domínio fiscal e tributário
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
import { ESTIMATES } from '../../../config/constants.js';

export class FiscalImporter extends ImportBase {
    /**
     * Importar impostos federais
     */
    async importarImpostosFederais(uiElement) {
        return await this.execute({
            name: 'impostos federais',
            endpoint: 'impostos-federais',
            apiMethod: API.fiscal.buscarImpostosFederais.bind(API.fiscal),
            uiElement,
            estimate: ESTIMATES.IMPOSTOS_FEDERAIS
        });
    }

    /**
     * Importar regime tributário
     */
    async importarRegimeTributario(uiElement) {
        return await this.execute({
            name: 'regime tributário',
            endpoint: 'regime-tributario',
            apiMethod: API.fiscal.buscarRegimeTributario.bind(API.fiscal),
            uiElement,
            estimate: ESTIMATES.REGIME_TRIBUTARIO
        });
    }

    /**
     * Importar situações fiscais
     */
    async importarSituacoesFiscais(uiElement) {
        return await this.execute({
            name: 'situações fiscais',
            endpoint: 'situacoes-fiscais',
            apiMethod: API.fiscal.buscarSituacoesFiscais.bind(API.fiscal),
            uiElement,
            estimate: ESTIMATES.SITUACOES_FISCAIS
        });
    }

    /**
     * Importar tabelas tributárias de entrada
     */
    async importarTabelasTributariasEntrada(uiElement) {
        return await this.execute({
            name: 'tabelas tributárias de entrada',
            endpoint: 'tabelas-tributarias-entrada',
            apiMethod: API.fiscal.buscarTabelasTributariasEntrada.bind(API.fiscal),
            uiElement,
            estimate: ESTIMATES.TABELAS_TRIBUTARIAS_ENTRADA
        });
    }

    /**
     * Importar tabelas tributárias de saída
     */
    async importarTabelasTributariasSaida(uiElement) {
        return await this.execute({
            name: 'tabelas tributárias de saída',
            endpoint: 'tabelas-tributarias-saida',
            apiMethod: API.fiscal.buscarTabelasTributariasSaida.bind(API.fiscal),
            uiElement,
            estimate: ESTIMATES.TABELAS_TRIBUTARIAS_SAIDA
        });
    }

    /**
     * Importar tipos de operações
     */
    async importarTiposOperacoes(uiElement) {
        return await this.execute({
            name: 'tipos de operações',
            endpoint: 'tipos-operacoes',
            apiMethod: API.fiscal.buscarTiposOperacoes.bind(API.fiscal),
            uiElement,
            estimate: ESTIMATES.TIPOS_OPERACOES
        });
    }
}

export default FiscalImporter;