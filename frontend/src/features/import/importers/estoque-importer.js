// frontend/src/features/import/importers/estoque-importer.js

/**
 * Importador de Estoque
 * Gerencia importações do domínio de estoque
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
export class EstoqueImporter extends ImportBase {
    /**
     * Importar locais de estoque
     */
    async importarLocalEstoque(uiElement) {
        return await this.execute({
            name: 'locais de estoque',
            endpoint: 'localEstoque',
            apiMethod: API.estoque.buscarLocalEstoque.bind(API.estoque),
            uiElement,
        });
    }

    /**
     * Importar tipos de ajustes
     */
    async importarTiposAjustes(uiElement) {
        return await this.execute({
            name: 'tipos de ajustes',
            endpoint: 'tiposAjustes',
            apiMethod: API.estoque.buscarTiposAjustes.bind(API.estoque),
            uiElement,
        });
    }

    /**
     * Importar saldo de estoque
     */
    async importarSaldoEstoque(uiElement) {
        return await this.execute({
            name:'saldo de estoque',
            endpoint: 'saldoEstoque',
            apiMethod: API.estoque.buscarSaldoEstoque.bind(API.estoque),
            uiElement,
        });
    }
}

export default EstoqueImporter;