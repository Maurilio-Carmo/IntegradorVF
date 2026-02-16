// frontend/src/services/api/produto-api.js

/**
 * API de Produtos
 * Endpoints relacionados a produtos, estrutura mercadológica
 */

import { APIBase } from './api-base.js';

export class ProdutoAPI extends APIBase {
    /**
     * Buscar seções
     */
    async buscarSecoes(onProgress) {
        return await this.fetchAll('produto/secoes', onProgress);
    }

    /**
     * Buscar grupos
     */
    async buscarGrupos(onProgress) {
        return await this.fetchAll('produto/grupos', onProgress);
    }

    /**
     * Buscar subgrupos
     */
    async buscarSubgrupos(onProgress) {
        return await this.fetchAll('produto/subgrupos', onProgress);
    }

    /**
     * Buscar marcas
     */
    async buscarMarcas(onProgress) {
        return await this.fetchAll('produto/marcas', onProgress);
    }

    /**
     * Buscar famílias
     */
    async buscarFamilias(onProgress) {
        return await this.fetchAll('produto/familias', onProgress);
    }

    /**
     * Buscar produtos
     */
    async buscarProdutos(onProgress) {
        return await this.fetchAll('produto/produtos', onProgress);
    }

    /**
     * Buscar produto por ID
     */
    async buscarProdutoPorId(id) {
        return await this.http.get(`produto/produtos/${id}`);
    }

    /**
     * Buscar estrutura mercadológica completa
     */
    async buscarEstruturaMercadologica(onProgress) {
        const estrutura = {
            secoes: await this.buscarSecoes(onProgress),
            grupos: await this.buscarGrupos(onProgress),
            subgrupos: await this.buscarSubgrupos(onProgress),
            marcas: await this.buscarMarcas(onProgress),
            familias: await this.buscarFamilias(onProgress)
        };

        return estrutura;
    }
}

export default ProdutoAPI;