// frontend/src/services/api/produto-api.js

/**
 * API de Produtos
 * Endpoints relacionados a produtos, estrutura mercadológica
 * 
 * ✅ CORRIGIDO: Grupos e Subgrupos agora usam endpoints hierárquicos
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
     * Buscar grupos (ENDPOINT HIERÁRQUICO)
     * Grupos dependem de seções, então precisamos buscar os grupos de cada seção
     */
    async buscarGrupos(onProgress) {
        console.log('📦 Iniciando busca hierárquica de grupos...');
        
        // 1. Primeiro buscar todas as seções
        const secoes = await this.fetchAll('produto/secoes');
        console.log(`✅ ${secoes.length} seções encontradas`);
        
        if (secoes.length === 0) {
            console.warn('⚠️ Nenhuma seção encontrada. Importe seções primeiro.');
            return [];
        }
        
        // 2. Buscar grupos de cada seção
        let todosGrupos = [];
        let totalProcessado = 0;
        
        for (const secao of secoes) {
            try {
                const endpoint = `produto/secoes/${secao.id}/grupos`;
                console.log(`🔍 Buscando grupos da seção ${secao.id} (${secao.descricao})...`);
                
                const gruposDaSecao = await this.fetchAll(endpoint);
                
                // Adicionar secaoId em cada grupo para referência
                const gruposComSecao = gruposDaSecao.map(grupo => ({
                    ...grupo,
                    secaoId: secao.id
                }));
                
                todosGrupos = todosGrupos.concat(gruposComSecao);
                totalProcessado += gruposDaSecao.length;
                
                console.log(`  ✅ ${gruposDaSecao.length} grupos encontrados`);
                
                // Callback de progresso
                if (onProgress) {
                    onProgress(totalProcessado);
                }
                
                // Pequena pausa entre seções
                await this.delay(100);
                
            } catch (error) {
                console.error(`❌ Erro ao buscar grupos da seção ${secao.id}:`, error.message);
                // Continua com as próximas seções
            }
        }
        
        console.log(`✅ Total de grupos encontrados: ${todosGrupos.length}`);
        return todosGrupos;
    }

    /**
     * Buscar subgrupos (ENDPOINT HIERÁRQUICO)
     * Subgrupos dependem de seções e grupos
     */
    async buscarSubgrupos(onProgress) {
        console.log('📦 Iniciando busca hierárquica de subgrupos...');
        
        // 1. Primeiro buscar todas as seções
        const secoes = await this.fetchAll('produto/secoes');
        console.log(`✅ ${secoes.length} seções encontradas`);
        
        if (secoes.length === 0) {
            console.warn('⚠️ Nenhuma seção encontrada. Importe seções primeiro.');
            return [];
        }
        
        let todosSubgrupos = [];
        let totalProcessado = 0;
        
        // 2. Para cada seção, buscar seus grupos
        for (const secao of secoes) {
            try {
                const endpointGrupos = `produto/secoes/${secao.id}/grupos`;
                const gruposDaSecao = await this.fetchAll(endpointGrupos);
                
                console.log(`🔍 Seção ${secao.id}: ${gruposDaSecao.length} grupos`);
                
                // 3. Para cada grupo, buscar seus subgrupos
                for (const grupo of gruposDaSecao) {
                    try {
                        const endpointSubgrupos = `produto/secoes/${secao.id}/grupos/${grupo.id}/subgrupos`;
                        console.log(`  🔍 Buscando subgrupos do grupo ${grupo.id} (${grupo.descricao})...`);
                        
                        const subgruposDoGrupo = await this.fetchAll(endpointSubgrupos);
                        
                        // Adicionar secaoId e grupoId em cada subgrupo
                        const subgruposComReferencias = subgruposDoGrupo.map(subgrupo => ({
                            ...subgrupo,
                            secaoId: secao.id,
                            grupoId: grupo.id
                        }));
                        
                        todosSubgrupos = todosSubgrupos.concat(subgruposComReferencias);
                        totalProcessado += subgruposDoGrupo.length;
                        
                        console.log(`    ✅ ${subgruposDoGrupo.length} subgrupos encontrados`);
                        
                        // Callback de progresso
                        if (onProgress) {
                            onProgress(totalProcessado);
                        }
                        
                        // Pequena pausa
                        await this.delay(100);
                        
                    } catch (error) {
                        console.error(`❌ Erro ao buscar subgrupos do grupo ${grupo.id}:`, error.message);
                        // Continua com os próximos grupos
                    }
                }
                
            } catch (error) {
                console.error(`❌ Erro ao processar seção ${secao.id}:`, error.message);
                // Continua com as próximas seções
            }
        }
        
        console.log(`✅ Total de subgrupos encontrados: ${todosSubgrupos.length}`);
        return todosSubgrupos;
    }

    /**
     * Buscar marcas
     */
    async buscarMarcas(onProgress, onPageFetched) {
        return await this.fetchAll('produto/marcas', onProgress, onPageFetched);
    }

    /**
     * Buscar famílias
     */
    async buscarFamilias(onProgress, onPageFetched) {
        return await this.fetchAll('produto/familias', onProgress, onPageFetched);
    }

    /**
     * Buscar produtos
     */
    async buscarProdutos(onProgress, onPageFetched) {
        return await this.fetchAll('produto/produtos', onProgress, onPageFetched);
    }

    /**
     * Buscar estrutura mercadológica completa
     */
    async buscarEstruturaMercadologica(onProgress) {
        console.log('🏗️ Iniciando importação completa da estrutura mercadológica...');
        
        const estrutura = {
            secoes: await this.buscarSecoes(onProgress),
            grupos: await this.buscarGrupos(onProgress),
            subgrupos: await this.buscarSubgrupos(onProgress),
        };

        console.log('✅ Estrutura mercadológica completa:', {
            secoes: estrutura.secoes.length,
            grupos: estrutura.grupos.length,
            subgrupos: estrutura.subgrupos.length,
        });

        return estrutura;
    }
}

export default ProdutoAPI;