// frontend/src/features/import/import-base.js

/**
 * Classe Base de Importação
 * Define o fluxo padrão: buscar da API → salvar no banco → atualizar UI → emitir eventos
 */

import DatabaseClient from '../../services/database/db-client.js';
import UI             from '../../ui/ui.js';
import Events         from '../../utils/events.js';

export class ImportBase {

    constructor() {
        this.db = new DatabaseClient();
    }

    /**
     * Executa o fluxo completo de importação de uma entidade.
     *
     * @param {object}    config
     * @param {string}    config.name        - Nome amigável (logs/UI)
     * @param {string}    config.endpoint    - Chave do endpoint no backend
     * @param {Function}  config.apiMethod   - Função que busca dados da API
     * @param {Function}  [config.transform] - Transformação opcional antes de salvar
     * @param {*}         config.uiElement   - Elemento de UI para feedback visual
     * @param {boolean}   [config.updateStats=true] - Atualizar estatísticas após importar
     *
     * @returns {{ success: boolean, total: number, error?: string }}
     */
    async execute(config) {
        const {
            name,
            endpoint,
            apiMethod,
            transform      = null,
            uiElement,
            updateStats    = true,
        } = config;

        try {
            // 1. Feedback inicial
            UI.log(`📥 Iniciando importação de ${name}...`, 'info');
            UI.status.updateImport(uiElement, 'loading', `Buscando ${name}...`);
            Events.import.started(name);

            let totalSalvos = 0;

            // Callback executado a cada página recebida da API
            const onPageFetched = async (items, _offset, totalReal) => {
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
                    Events.import.progress(name, totalSalvos, totalReal);
                }
            };

            // Busca paginada — callback de progresso + callback por página
            await apiMethod(
                (atual, _itens, totalReal) => {
                    UI.log(`📄 ${name}: ${atual} buscados`, 'info');
                },
                onPageFetched
            );

            UI.log(`✅ ${name}: ${totalSalvos} registros importados com sucesso`, 'success');
            UI.status.updateImport(uiElement, 'success', `${totalSalvos} registros`);
            Events.import.completed(name, totalSalvos);

            // Atualiza estatísticas no final (pode ser desativado via config)
            if (updateStats) {
                await this._refreshStatistics();
            }

            return { success: true, total: totalSalvos };

        } catch (error) {
            UI.log(`❌ Erro ao importar ${name}: ${error.message}`, 'error');
            UI.status.updateImport(uiElement, 'error', error.message);
            Events.import.failed(name, error);

            return { success: false, total: 0, error: error.message };
        }
    }

    /**
     * Executa múltiplas importações em sequência.
     * As estatísticas são atualizadas UMA vez ao final do lote,
     * em vez de após cada item individualmente.
     *
     * @param {Array<object>} imports - Array de configs (mesmo formato de execute())
     * @returns {{ success: Array, failed: Array, total: number }}
     */
    async executeBatch(imports) {
        const results = {
            success: [],
            failed:  [],
            total:   imports.length,
        };

        for (const importConfig of imports) {
            const result = await this.execute({ ...importConfig, updateStats: false });

            if (result.success) {
                results.success.push({ name: importConfig.name, count: result.total });
            } else {
                results.failed.push({ name: importConfig.name, error: result.error });
            }
        }

        // Atualiza estatísticas uma única vez após todo o lote
        await this._refreshStatistics();

        return results;
    }

    /**
     * Busca as estatísticas do banco e atualiza a UI.
     * Privado — use updateStats: true/false na config do execute().
     */
    async _refreshStatistics() {
        try {
            const stats = await this.db.getStatistics();
            if (stats) {
                UI.statistics.update(stats);
                Events.stats.updated(stats);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas:', error);
        }
    }
}

export default ImportBase;