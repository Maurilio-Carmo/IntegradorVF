// frontend/src/features/import/importers/pessoa-importer.js

/**
 * Importador de Pessoas
 * Gerencia importações do domínio de pessoas (clientes, fornecedores, lojas)
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
import { ESTIMATES } from '../../../config/constants.js';

export class PessoaImporter extends ImportBase {
    /**
     * Importar clientes
     */
    async importarClientes(uiElement) {
        return await this.execute({
            name: 'clientes',
            endpoint: 'clientes',
            apiMethod: API.pessoa.buscarClientes.bind(API.pessoa),
            uiElement,
            estimate: ESTIMATES.CLIENTES
        });
    }

    /**
     * Importar fornecedores
     */
    async importarFornecedores(uiElement) {
        return await this.execute({
            name: 'fornecedores',
            endpoint: 'fornecedores',
            apiMethod: API.pessoa.buscarFornecedores.bind(API.pessoa),
            uiElement,
            estimate: ESTIMATES.FORNECEDORES
        });
    }

    /**
     * Importar lojas
     */
    async importarLojas(uiElement) {
        return await this.execute({
            name: 'lojas',
            endpoint: 'lojas',
            apiMethod: API.administracao.buscarLojas.bind(API.administracao),
            uiElement,
            estimate: ESTIMATES.LOJAS
        });
    }
}

export default PessoaImporter;