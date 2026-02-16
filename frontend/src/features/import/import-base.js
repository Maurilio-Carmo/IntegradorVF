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
     * Executar importação genérica
     */
    async execute(config) {
        const {
            name,           // Nome amigável da entidade
            endpoint,       // Endpoint do banco
            apiMethod,      // Método da API para buscar dados
            uiElement,      // Elemento UI para feedback
            estimate = 500  // Estimativa de registros
        } = config;

        try {
            // 1. Feedback inicial
            UI.log(`📥 Iniciando importação de ${name}...`, 'info');
            UI.status.updateImport(uiElement, 'loading', `Buscando ${name}...`);

            // 2. Buscar dados da API
            const data = await apiMethod((total) => {
                UI.log(`   📄 ${name}: ${total} registros`, 'info');
                const percentage = Math.min(Math.floor((total / estimate) * 100), 99);
                UI.status.updateImport(uiElement, 'progress', percentage);
            });

            UI.log(`✅ ${data.length} ${name} buscados da API`, 'success');

            // 3. Salvar no banco
            UI.log(`💾 Salvando ${name} no banco...`, 'info');
            await this.db.save(endpoint, data);
            UI.log(`✅ ${data.length} ${name} salvos no banco`, 'success');

            // 4. Atualizar UI
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
     * Executar múltiplas importações em sequência
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
                    results.success.push({
                        name: importConfig.name,
                        count: result.count
                    });
                } else {
                    results.failed.push({
                        name: importConfig.name,
                        error: result.error
                    });
                }
            } catch (error) {
                results.failed.push({
                    name: importConfig.name,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Atualizar estatísticas do banco na UI
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