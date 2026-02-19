// frontend/src/features/import/importers/produto-importer.js

/**
 * Importador de Produtos
 * Gerencia importações do domínio de produtos
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';

export class ProdutoImporter extends ImportBase {
    /**
     * Importar seções
     */
    async importarSecoes(uiElement) {
        return await this.execute({
            name: 'seções',
            endpoint: 'secoes',
            apiMethod: API.produto.buscarSecoes.bind(API.produto),
            uiElement
        });
    }

    /**
     * Importar grupos
     */
    async importarGrupos(uiElement) {
        return await this.execute({
            name: 'grupos',
            endpoint: 'grupos',
            apiMethod: API.produto.buscarGrupos.bind(API.produto),
            uiElement
        });
    }

    /**
     * Importar subgrupos
     */
    async importarSubgrupos(uiElement) {
        return await this.execute({
            name: 'subgrupos',
            endpoint: 'subgrupos',
            apiMethod: API.produto.buscarSubgrupos.bind(API.produto),
            uiElement
        });
    }

    /**
     * Importar marcas
     */
    async importarMarcas(uiElement) {
        return await this.execute({
            name: 'marcas',
            endpoint: 'marcas',
            apiMethod: API.produto.buscarMarcas.bind(API.produto),
            uiElement
        });
    }

    /**
     * Importar famílias
     */
    async importarFamilias(uiElement) {
        return await this.execute({
            name: 'famílias',
            endpoint: 'familias',
            apiMethod: API.produto.buscarFamilias.bind(API.produto),
            uiElement
        });
    }

    /**
     * Importar produtos
     */
    async importarProdutos(uiElement) {
        return await this.execute({
            name: 'produtos',
            endpoint: 'produtos',
            apiMethod: API.produto.buscarProdutos.bind(API.produto),
            uiElement
        });
    }
}

export default ProdutoImporter;