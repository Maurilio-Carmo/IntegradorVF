// frontend/src/features/import/import-base.js

/**
 * Classe Base de Importação
 * Define o fluxo padrão de importação: buscar da API → salvar no banco → atualizar UI
 */

import DatabaseClient from '../../services/database/db-client.js';
import UI from '../../ui/ui.js';

export class ImportBase {
    constructor() {
        this.db = new DatabaseClient();
    }

    /**
     * Executar importação genérica.
     *
     * @param {object} config
     * @param {string}    config.name       - Nome amigável da entidade (para logs/UI)
     * @param {string}    config.endpoint   - Endpoint do backend  POST /api/importacao/<endpoint>
     * @param {Function}  config.apiMethod  - Função que busca dados da API (retorna Array)
     * @param {Function}  [config.transform]- Transformação opcional aplicada ANTES de salvar (data: Array) => Array
     * @param {*}         config.uiElement  - Elemento de UI para feedback visual
     */

    async execute(config) {
        const {
            name,
            endpoint,
            apiMethod,
            transform = null,   // ← novo campo opcional
            uiElement,
        } = config;

        try {
            // 1. Feedback inicial
            UI.log(`📥 Iniciando importação de ${name}...`, 'info');
            UI.status.updateImport(uiElement, 'loading', `Buscando ${name}...`);

            // 2. Buscar dados da API
            const rawData = await apiMethod((atual, _itensDaPagina, totalReal) => {
                const divisor = totalReal;
                const percentage = Math.min(Math.floor((atual / divisor) * 100), 99);

                // Atualiza texto com contagem real
                const statusDiv = uiElement?.querySelector('.import-item-status');
                if (statusDiv) {
                    const label = totalReal
                        ? `${atual} de ${totalReal} (${percentage}%)`
                        : `${atual} registros... (${percentage}%)`;
                    statusDiv.textContent = label;
                }

                UI.log(`   📄 ${name}: ${atual}${totalReal ? '/' + totalReal : ''} registros`, 'info');
                UI.status.updateImport(uiElement, 'progress', percentage);
            });

            UI.log(`✅ ${rawData.length} ${name} buscados da API`, 'success');

            // 3. ✅ Aplicar transformação se fornecida (flatMap, desestruturação, etc.)
            const data = transform ? transform(rawData) : rawData;

            if (transform) {
                UI.log(`🔄 ${name}: ${rawData.length} → ${data.length} registros após transformação`, 'info');
            }

            // 4. Salvar no banco
            UI.log(`💾 Salvando ${data.length} ${name} no banco...`, 'info');
            await this.db.save(endpoint, data);
            UI.log(`✅ ${data.length} ${name} salvos no banco`, 'success');

            // 5. Atualizar UI
            UI.status.updateImport(uiElement, 'success', `${data.length} registros`);

            return {
                success: true,
                count: data.length,
                data
            };

        } catch (error) {
            UI.log(`❌ Erro ao importar ${name}: ${error.message}`, 'error');
            UI.status.updateImport(uiElement, 'error', error.message);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Executar múltiplas importações em sequência.
     */
    async executeBatch(imports) {
        const results = {
            success: [],
            failed: [],
            total: imports.length
        };

        for (const importConfig of imports) {
            try {
                const result = await this.execute(importConfig);

                if (result.success) {
                    results.success.push({ name: importConfig.name, count: result.count });
                } else {
                    results.failed.push({ name: importConfig.name, error: result.error });
                }
            } catch (error) {
                results.failed.push({ name: importConfig.name, error: error.message });
            }
        }

        return results;
    }

    /**
     * Atualizar estatísticas do banco na UI.
     */
    async updateStatistics() {
        try {
            const stats = await this.db.getStatistics();
            if (stats) {
                UI.statistics.update(stats);
                UI.log('📊 Estatísticas atualizadas', 'info');
            }
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
        }
    }
}

export default ImportBase;