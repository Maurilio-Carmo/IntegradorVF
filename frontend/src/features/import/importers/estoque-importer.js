// frontend/src/features/import/importers/estoque-importer.js

/**
 * Importador de Estoque
 * Gerencia importações do domínio de estoque
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
import { ESTIMATES } from '../../../config/constants.js';

export class EstoqueImporter extends ImportBase {
    /**
     * Importar locais de estoque
     */
    async importarLocalEstoque(uiElement) {
        return await this.execute({
            name: 'locais de estoque',
            endpoint: 'local-estoque',
            apiMethod: API.estoque.buscarLocalEstoque.bind(API.estoque),
            uiElement,
            estimate: ESTIMATES.LOCAL_ESTOQUE
        });
    }

    /**
     * Importar tipos de ajustes
     */
    async importarTiposAjustes(uiElement) {
        return await this.execute({
            name: 'tipos de ajustes',
            endpoint: 'tipos-ajustes',
            apiMethod: API.estoque.buscarTiposAjustes.bind(API.estoque),
            uiElement,
            estimate: ESTIMATES.TIPOS_AJUSTES
        });
    }
}

export default EstoqueImporter;