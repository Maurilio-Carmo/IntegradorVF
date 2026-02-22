// frontend/src/services/api/modules.js

import { APIBase } from './api-base.js';

// PRODUTO
export class ProdutoAPI extends APIBase {

    async buscarSecoes(onProgress, onPageFetched) {
        return await this.fetchAll('produto/secoes', onProgress, onPageFetched);
    }

    /**
     * Busca hierárquica — grupos dependem de seções
     * onPageFetched não se aplica: loop manual, não usa fetchAll paginado
     */
    async buscarGrupos(onProgress) {
        const secoes = await this.fetchAll('produto/secoes');
        if (secoes.length === 0) return [];

        let todosGrupos = [];
        let totalProcessado = 0;

        for (const secao of secoes) {
            try {
                const grupos = await this.fetchAll(`produto/secoes/${secao.id}/grupos`);

                todosGrupos = todosGrupos.concat(
                    grupos.map(g => ({ ...g, secaoId: secao.id }))
                );
                totalProcessado += grupos.length;

                if (onProgress) onProgress(totalProcessado);
                await this.delay(100);

            } catch (error) {
                console.error(`❌ Grupos da seção ${secao.id}:`, error.message);
            }
        }

        return todosGrupos;
    }

    /**
     * Busca hierárquica — subgrupos dependem de seções e grupos
     * onPageFetched não se aplica: loop manual, não usa fetchAll paginado
     */
    async buscarSubgrupos(onProgress) {
        const secoes = await this.fetchAll('produto/secoes');
        if (secoes.length === 0) return [];

        let todosSubgrupos = [];
        let totalProcessado = 0;

        for (const secao of secoes) {
            try {
                const grupos = await this.fetchAll(`produto/secoes/${secao.id}/grupos`);

                for (const grupo of grupos) {
                    try {
                        const subgrupos = await this.fetchAll(
                            `produto/secoes/${secao.id}/grupos/${grupo.id}/subgrupos`
                        );

                        todosSubgrupos = todosSubgrupos.concat(
                            subgrupos.map(s => ({ ...s, secaoId: secao.id, grupoId: grupo.id }))
                        );
                        totalProcessado += subgrupos.length;

                        if (onProgress) onProgress(totalProcessado);
                        await this.delay(100);

                    } catch (error) {
                        console.error(`❌ Subgrupos do grupo ${grupo.id}:`, error.message);
                    }
                }
            } catch (error) {
                console.error(`❌ Seção ${secao.id}:`, error.message);
            }
        }

        return todosSubgrupos;
    }

    async buscarMarcas(onProgress, onPageFetched) {
        return await this.fetchAll('produto/marcas', onProgress, onPageFetched);
    }

    async buscarFamilias(onProgress, onPageFetched) {
        return await this.fetchAll('produto/familias', onProgress, onPageFetched);
    }

    async buscarProdutos(onProgress, onPageFetched) {
        return await this.fetchAll('produto/produtos', onProgress, onPageFetched);
    }

    async buscarCodigosAuxiliares(onProgress, onPageFetched) {
        return await this.fetchAll('produto/codigos-auxiliares', onProgress, onPageFetched, 'produtoId');
    }

    async buscarProdutoFornecedores(produtoId) {
        return await this.fetchAll(`produto/produtos/${produtoId}/fornecedores`);
    }
}

// FINANCEIRO API
export class FinanceiroAPI extends APIBase {
    async buscarCategorias(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/categorias', onProgress, onPageFetched);
    }

    async buscarAgentes(onProgress, onPageFetched) {
        return await this.fetchAll('pessoa/agentes-financeiros', onProgress, onPageFetched);
    }

    async buscarContasCorrentes(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/contas-correntes', onProgress, onPageFetched);
    }

    async buscarEspeciesDocumento(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/especies-documentos', onProgress, onPageFetched);
    }

    async buscarHistoricoPadrao(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/historicos-padrao', onProgress, onPageFetched);
    }
}

// PDV API
export class PDVAPI extends APIBase {
    async buscarFormasPagamento(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/formas-pagamento', onProgress, onPageFetched);
    }

    async buscarPagamentosPDV(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/pagamentos-pdv', onProgress, onPageFetched);
    }

    async buscarRecebimentosPDV(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/recebimentos-pdv', onProgress, onPageFetched);
    }

    async buscarMotivosCancelamento(onProgress, onPageFetched) {
        return await this.fetchAll('motivos-cancelamento', onProgress, onPageFetched);
    }

    async buscarMotivosDesconto(onProgress, onPageFetched) {
        return await this.fetchAll('motivos-desconto', onProgress, onPageFetched);
    }

    async buscarMotivosDevolucao(onProgress, onPageFetched) {
        return await this.fetchAll('financeiro/motivos-devolucao', onProgress, onPageFetched);
    }
}

// ESTOQUE API
export class EstoqueAPI extends APIBase {
    async buscarLocalEstoque(onProgress, onPageFetched) {
        return await this.fetchAll('estoque/locais', onProgress, onPageFetched);
    }

    async buscarTiposAjustes(onProgress, onPageFetched) {
        return await this.fetchAll('estoque/tipos-ajuste', onProgress, onPageFetched);
    }
}

// FISCAL API
export class FiscalAPI extends APIBase {
    async buscarImpostosFederais(onProgress, onPageFetched) {
        return await this.fetchAll('fiscal/impostos-federais', onProgress, onPageFetched);
    }

    async buscarRegimeTributario(onProgress, onPageFetched) {
        return await this.fetchAll('fiscal/regime-estadual-tributario', onProgress, onPageFetched);
    }

    async buscarSituacoesFiscais(onProgress, onPageFetched) {
        return await this.fetchAll('fiscal/situacoes', onProgress, onPageFetched);
    }

    async buscarTiposOperacoes(onProgress, onPageFetched) {
        return await this.fetchAll('fiscal/operacoes', onProgress, onPageFetched);
    }

    async buscarTabelasTributarias(onProgress, onPageFetched) {
        return await this.fetchAll('fiscal/tabelas-tributarias', onProgress, onPageFetched);
    }
}

// PESSOA 
export class PessoaAPI extends APIBase {
    async buscarLojas(onProgress, onPageFetched) {
        return await this.fetchAll('pessoa/lojas', onProgress, onPageFetched);
    }

    async buscarClientes(onProgress, onPageFetched) {
        return await this.fetchAll('pessoa/clientes', onProgress, onPageFetched);
    }

    async buscarFornecedores(onProgress, onPageFetched) {
        return await this.fetchAll('pessoa/fornecedores', onProgress, onPageFetched);
    }
}

// ADMINISTRAÇÃO API
export class AdministracaoAPI extends APIBase {
    async buscarLicenciamento() {
        return await this.http.get('administracao/licenciamento');
    }

}