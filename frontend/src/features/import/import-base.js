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
            transform = null,
            uiElement
        } = config;

        try {
            // 1. Feedback inicial
            UI.log(`📥 Iniciando importação de ${name}...`, 'info');
            UI.status.updateImport(uiElement, 'loading', `Buscando ${name}...`);

            let totalSalvos = 0;

            // Callback executado a cada página recebida da API
            const onPageFetched = async (items, offset, totalReal) => {
                const data = transform ? transform(items) : items;

                await this.db.save(endpoint, data);

                totalSalvos += data.length;

                const pct = totalReal
                    ? Math.min(Math.floor((totalSalvos / totalReal) * 100), 99)
                    : null;

                UI.log(
                    `💾 ${name}: ${totalSalvos}${totalReal ? ' / ' + totalReal : ''} gravados`,
                    'info'
                );

                if (pct !== null) {
                    UI.status.updateImport(uiElement, 'progress', pct);
                }
            };

            const rawData = await apiMethod(
                (atual, _itens, totalReal) => {
                    UI.log(`📄 ${name}: ${atual} buscados`, 'info');
                },
                onPageFetched
            );

            UI.log(`✅ ${name}: ${totalSalvos} registros importados com sucesso`, 'success');
            UI.status.updateImport(uiElement, 'success', `${totalSalvos} registros`);

            return { total: totalSalvos };

        } catch (error) {
            UI.log(`❌ Erro ao importar ${name}: ${error.message}`, 'error');
            UI.status.updateImport(uiElement, 'error', error.message);
            throw error;
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