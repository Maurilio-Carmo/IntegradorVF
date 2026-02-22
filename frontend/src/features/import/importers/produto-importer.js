// frontend/src/features/import/importers/produto-importer.js

/**
 * Importador de Produtos
 * Gerencia importações do domínio de produtos
 */

import { ImportBase } from '../import-base.js';
import API from '../../../services/api/index.js';
import UI from '../../../ui/ui.js';

export class ProdutoImporter extends ImportBase {

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

    /**
     * Importar códigos auxiliares
     */
    async importarCodigosAuxiliares(uiElement) {
        return await this.execute({
            name:      'códigos auxiliares',
            endpoint:  'codigosAuxiliares',
            apiMethod: API.produto.buscarCodigosAuxiliares.bind(API.produto),
            uiElement,
        });
    }

    /**
     * Importar fornecedores do produto
     */
    async importarProdutoFornecedores(uiElement) {
        try {
            UI.log('📥 Iniciando importação de fornecedores do produto...', 'info');
            UI.status.updateImport(uiElement, 'loading', 'Buscando IDs do banco local...');

            const response = await fetch('/api/importacao/produto-ids');
            if (!response.ok) throw new Error('Falha ao buscar IDs de produtos');
            const { ids: produtoIds, total: totalProdutos } = await response.json();

            if (!produtoIds || produtoIds.length === 0) {
                UI.status.updateImport(uiElement, 'success', 'Nenhum produto no banco');
                UI.log('⚠️ Nenhum produto encontrado no banco local. Importe os produtos primeiro.', 'warning');
                return { success: true, total: 0 };
            }

            UI.log(`📦 Consultando fornecedores de ${totalProdutos} produtos...`, 'info');

            let consultados = 0;
            let totalSalvos = 0;

            for (const produtoId of produtoIds) {
                try {
                    const fornecedores = await API.produto.buscarProdutoFornecedores(produtoId);

                    consultados++;

                    if (fornecedores.length > 0) {
                        await this.db.save('produtoFornecedores', fornecedores);
                        totalSalvos += fornecedores.length;
                    }

                    const pct = Math.min(Math.floor((consultados / totalProdutos) * 100), 99);
                    UI.status.updateImport(
                        uiElement,
                        'loading',
                        `${consultados} / ${totalProdutos} (${pct}%)`
                    );
                    UI.status.updateImport(uiElement, 'progress', pct);

                } catch (error) {
                    console.error(`❌ Fornecedores do produto ${produtoId}:`, error.message);
                    consultados++;
                }
            }

            UI.log(`✅ Fornecedores do produto: ${totalSalvos} registros importados (${consultados} produtos consultados)`, 'success');
            UI.status.updateImport(uiElement, 'success', `${totalSalvos} fornecedores de ${consultados} produtos`);

            return { success: true, total: totalSalvos };

        } catch (error) {
            UI.log(`❌ Erro ao importar fornecedores do produto: ${error.message}`, 'error');
            UI.status.updateImport(uiElement, 'error', error.message);
            return { success: false, total: 0, error: error.message };
        }
    }
}

export default ProdutoImporter;