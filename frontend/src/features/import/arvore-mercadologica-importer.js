// frontend/src/features/import/arvore-mercadologica-importer.js

/**
 * Importador de Árvore Mercadológica Completa
 * Importa Seções, Grupos e Subgrupos em sequência
 */

import { ImportBase } from './import-base.js';
import API from '../../services/api/index.js';
import UI from '../../ui/ui.js';

export class ArvoreMercadologicaImporter extends ImportBase {
    
    /**
     * Importar estrutura completa: Seções → Grupos → Subgrupos
     */
    async importarArvoreMercadologica(uiElement) {
        try {
            UI.log('═══════════════════════════════════════', 'info');
            UI.log('🌳 IMPORTAÇÃO DA ÁRVORE MERCADOLÓGICA', 'info');
            UI.log('═══════════════════════════════════════', 'info');
            UI.log('📋 Sequência: Seções → Grupos → Subgrupos', 'info');
            UI.log('═══════════════════════════════════════', 'info');

            // Atualizar UI inicial
            UI.status.updateImport(uiElement, 'loading', 'Iniciando...');

            let totalSecoesImportadas = 0;
            let totalGruposImportados = 0;
            let totalSubgruposImportados = 0;

            // ============================================
            // ETAPA 1: IMPORTAR SEÇÕES
            // ============================================
            UI.log('\n📁 ETAPA 1/3: Importando Seções...', 'info');
            UI.status.updateImport(uiElement, 'loading', '1/3 - Seções...');

            try {
                const secoes = await API.produto.buscarSecoes((total) => {
                    UI.log(`   📄 Seções: ${total} registros`, 'info');
                    const percentage = Math.min(Math.floor((total / 100) * 33), 33);
                    UI.status.updateImport(uiElement, 'progress', percentage);
                });

                UI.log(`✅ ${secoes.length} seções encontradas na API`, 'success');

                // Salvar seções no banco
                UI.log(`💾 Salvando seções no banco...`, 'info');
                await this.db.save('secoes', secoes);
                totalSecoesImportadas = secoes.length;
                UI.log(`✅ ${totalSecoesImportadas} seções salvas no banco`, 'success');

            } catch (error) {
                UI.log(`❌ Erro ao importar seções: ${error.message}`, 'error');
                throw new Error(`Falha na importação de seções: ${error.message}`);
            }

            // ============================================
            // ETAPA 2: IMPORTAR GRUPOS (HIERÁRQUICO)
            // ============================================
            UI.log('\n📂 ETAPA 2/3: Importando Grupos (hierárquico)...', 'info');
            UI.status.updateImport(uiElement, 'loading', '2/3 - Grupos...');

            try {
                const grupos = await API.produto.buscarGrupos((total) => {
                    UI.log(`   📄 Grupos: ${total} registros`, 'info');
                    const percentage = 33 + Math.min(Math.floor((total / 500) * 33), 33);
                    UI.status.updateImport(uiElement, 'progress', percentage);
                });

                UI.log(`✅ ${grupos.length} grupos encontrados na API`, 'success');

                // Salvar grupos no banco
                UI.log(`💾 Salvando grupos no banco...`, 'info');
                await this.db.save('grupos', grupos);
                totalGruposImportados = grupos.length;
                UI.log(`✅ ${totalGruposImportados} grupos salvos no banco`, 'success');

            } catch (error) {
                UI.log(`❌ Erro ao importar grupos: ${error.message}`, 'error');
                throw new Error(`Falha na importação de grupos: ${error.message}`);
            }

            // ============================================
            // ETAPA 3: IMPORTAR SUBGRUPOS (HIERÁRQUICO)
            // ============================================
            UI.log('\n📑 ETAPA 3/3: Importando Subgrupos (hierárquico)...', 'info');
            UI.status.updateImport(uiElement, 'loading', '3/3 - Subgrupos...');

            try {
                const subgrupos = await API.produto.buscarSubgrupos((total) => {
                    UI.log(`   📄 Subgrupos: ${total} registros`, 'info');
                    const percentage = 66 + Math.min(Math.floor((total / 1000) * 34), 34);
                    UI.status.updateImport(uiElement, 'progress', percentage);
                });

                UI.log(`✅ ${subgrupos.length} subgrupos encontrados na API`, 'success');

                // Salvar subgrupos no banco
                UI.log(`💾 Salvando subgrupos no banco...`, 'info');
                await this.db.save('subgrupos', subgrupos);
                totalSubgruposImportados = subgrupos.length;
                UI.log(`✅ ${totalSubgruposImportados} subgrupos salvos no banco`, 'success');

            } catch (error) {
                UI.log(`❌ Erro ao importar subgrupos: ${error.message}`, 'error');
                throw new Error(`Falha na importação de subgrupos: ${error.message}`);
            }

            // ============================================
            // FINALIZAÇÃO
            // ============================================
            const totalGeral = totalSecoesImportadas + totalGruposImportados + totalSubgruposImportados;

            UI.log('═══════════════════════════════════════', 'success');
            UI.log('✅ ÁRVORE MERCADOLÓGICA IMPORTADA!', 'success');
            UI.log('═══════════════════════════════════════', 'success');
            UI.log(`📊 Resumo:`, 'info');
            UI.log(`   📁 Seções: ${totalSecoesImportadas}`, 'info');
            UI.log(`   📂 Grupos: ${totalGruposImportados}`, 'info');
            UI.log(`   📑 Subgrupos: ${totalSubgruposImportados}`, 'info');
            UI.log(`   🎯 Total: ${totalGeral} registros`, 'info');
            UI.log('═══════════════════════════════════════', 'success');

            // Atualizar UI final
            UI.status.updateImport(uiElement, 'success', `${totalGeral} registros`);

            return {
                success: true,
                secoes: totalSecoesImportadas,
                grupos: totalGruposImportados,
                subgrupos: totalSubgruposImportados,
                total: totalGeral
            };

        } catch (error) {
            UI.log(`❌ ERRO NA IMPORTAÇÃO: ${error.message}`, 'error');
            UI.status.updateImport(uiElement, 'error', error.message);
            throw error;
        }
    }
}

export default ArvoreMercadologicaImporter;