// backend/src/modules/comparator/Comparator.js

const Logger = require('../../utils/logger.js');

/**
 * Módulo de Comparação (Sync Comparator)
 * 
 * Responsável por:
 * - Comparar datasets SQLite ↔ Firebird
 * - Detectar diferenças (inclusões, alterações, exclusões)
 * - Produzir relatório estruturado de mudanças
 * 
 * NÃO acessa diretamente API ou UI (baixo acoplamento)
 */

class Comparator {
    /**
     * Comparar dois conjuntos de dados
     * 
     * @param {Array} sourceData - Dados da origem (SQLite)
     * @param {Array} targetData - Dados do destino (Firebird)
     * @param {Object} options - Opções de comparação
     * @returns {Object} Relatório de diferenças
     */
    static compare(sourceData, targetData, options = {}) {
        const startTime = Date.now();
        
        const {
            keyField = 'id',
            compareFields = [],
            caseSensitive = false,
            trimStrings = true
        } = options;

        Logger.info(`🔍 Iniciando comparação: ${sourceData.length} registros origem vs ${targetData.length} registros destino`);

        // Inicializar resultado
        const result = {
            summary: {
                sourceTotal: sourceData.length,
                targetTotal: targetData.length,
                toCreate: 0,
                toUpdate: 0,
                toDelete: 0,
                unchanged: 0,
                processingTime: 0
            },
            toCreate: [],      // Existe no target, não no source
            toUpdate: [],      // Existe em ambos mas com diferenças
            toDelete: [],      // Existe no source, não no target
            unchanged: []      // Idênticos
        };

        try {
            // Criar maps para lookup O(1)
            const sourceMap = this.buildMap(sourceData, keyField);
            const targetMap = this.buildMap(targetData, keyField);

            // Analisar registros do target
            for (const targetItem of targetData) {
                const key = this.normalizeKey(targetItem[keyField], options);
                const sourceItem = sourceMap.get(key);

                if (!sourceItem) {
                    // Novo registro (criar no source)
                    result.toCreate.push(targetItem);
                } else {
                    // Verificar mudanças
                    const changes = this.detectChanges(
                        sourceItem, 
                        targetItem, 
                        compareFields, 
                        options
                    );

                    if (Object.keys(changes).length > 0) {
                        result.toUpdate.push({
                            key,
                            source: sourceItem,
                            target: targetItem,
                            changes
                        });
                    } else {
                        result.unchanged.push(targetItem);
                    }
                }
            }

            // Detectar deleções (existe no source mas não no target)
            for (const sourceItem of sourceData) {
                const key = this.normalizeKey(sourceItem[keyField], options);
                if (!targetMap.has(key)) {
                    result.toDelete.push(sourceItem);
                }
            }

            // Atualizar summary
            result.summary.toCreate = result.toCreate.length;
            result.summary.toUpdate = result.toUpdate.length;
            result.summary.toDelete = result.toDelete.length;
            result.summary.unchanged = result.unchanged.length;
            result.summary.processingTime = Date.now() - startTime;

            Logger.success(`✅ Comparação concluída em ${result.summary.processingTime}ms`);
            Logger.info(`📊 Criar: ${result.summary.toCreate} | Atualizar: ${result.summary.toUpdate} | Deletar: ${result.summary.toDelete} | Sem mudanças: ${result.summary.unchanged}`);

            return result;

        } catch (error) {
            Logger.error('❌ Erro durante comparação:', error);
            throw error;
        }
    }

    /**
     * Construir Map para lookup eficiente
     */
    static buildMap(data, keyField) {
        const map = new Map();
        
        for (const item of data) {
            const key = this.normalizeKey(item[keyField]);
            map.set(key, item);
        }
        
        return map;
    }

    /**
     * Normalizar chave para comparação
     */
    static normalizeKey(key, options = {}) {
        if (key === null || key === undefined) {
            return null;
        }

        let normalized = String(key);

        if (options.trimStrings) {
            normalized = normalized.trim();
        }

        if (!options.caseSensitive) {
            normalized = normalized.toLowerCase();
        }

        return normalized;
    }

    /**
     * Detectar mudanças entre dois objetos
     */
    static detectChanges(sourceObj, targetObj, fields = [], options = {}) {
        const changes = {};

        // Se não especificou campos, comparar todos
        if (fields.length === 0) {
            fields = [
                ...new Set([
                    ...Object.keys(sourceObj),
                    ...Object.keys(targetObj)
                ])
            ];
        }

        for (const field of fields) {
            const sourceValue = this.normalizeValue(sourceObj[field], options);
            const targetValue = this.normalizeValue(targetObj[field], options);

            if (!this.valuesEqual(sourceValue, targetValue)) {
                changes[field] = {
                    from: sourceValue,
                    to: targetValue
                };
            }
        }

        return changes;
    }

    /**
     * Normalizar valor para comparação
     */
    static normalizeValue(value, options = {}) {
        // Null/undefined são equivalentes
        if (value === null || value === undefined) {
            return null;
        }

        // Strings
        if (typeof value === 'string') {
            let normalized = value;

            if (options.trimStrings) {
                normalized = normalized.trim();
            }

            if (!options.caseSensitive) {
                normalized = normalized.toLowerCase();
            }

            return normalized;
        }

        // Números
        if (typeof value === 'number') {
            return value;
        }

        // Datas
        if (value instanceof Date) {
            return value.toISOString();
        }

        // Objetos/Arrays (converter para JSON)
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return value;
    }

    /**
     * Verificar se dois valores são iguais
     */
    static valuesEqual(value1, value2) {
        // Ambos null/undefined
        if ((value1 === null || value1 === undefined) && 
            (value2 === null || value2 === undefined)) {
            return true;
        }

        // Um é null e outro não
        if (value1 === null || value2 === null) {
            return false;
        }

        return value1 === value2;
    }

    /**
     * Gerar relatório resumido em texto
     */
    static generateReport(comparisonResult) {
        const { summary } = comparisonResult;

        const lines = [
            '╔═══════════════════════════════════════╗',
            '║     RELATÓRIO DE COMPARAÇÃO          ║',
            '╠═══════════════════════════════════════╣',
            `║ Origem:         ${String(summary.sourceTotal).padStart(6)} registros    ║`,
            `║ Destino:        ${String(summary.targetTotal).padStart(6)} registros    ║`,
            '╠═══════════════════════════════════════╣',
            `║ ✅ Sem mudanças: ${String(summary.unchanged).padStart(6)} registros    ║`,
            `║ ➕ Criar:        ${String(summary.toCreate).padStart(6)} registros    ║`,
            `║ 🔄 Atualizar:    ${String(summary.toUpdate).padStart(6)} registros    ║`,
            `║ ❌ Deletar:      ${String(summary.toDelete).padStart(6)} registros    ║`,
            '╠═══════════════════════════════════════╣',
            `║ ⏱️  Tempo:       ${String(summary.processingTime).padStart(6)}ms         ║`,
            '╚═══════════════════════════════════════╝'
        ];

        return lines.join('\n');
    }

    /**
     * Validar resultado de comparação
     */
    static validateResult(result) {
        const errors = [];

        if (!result.summary) {
            errors.push('Falta campo "summary"');
        }

        if (!Array.isArray(result.toCreate)) {
            errors.push('Campo "toCreate" deve ser um array');
        }

        if (!Array.isArray(result.toUpdate)) {
            errors.push('Campo "toUpdate" deve ser um array');
        }

        if (!Array.isArray(result.toDelete)) {
            errors.push('Campo "toDelete" deve ser um array');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Comparar estrutura mercadológica (caso específico)
     */
    static compareEstruturaMercadologica(sqliteData, firebirdData) {
        Logger.info('🏗️ Comparando estrutura mercadológica...');

        const results = {};

        // Comparar seções
        if (sqliteData.secoes && firebirdData.secoes) {
            results.secoes = this.compare(
                sqliteData.secoes,
                firebirdData.secoes,
                {
                    keyField: 'id',
                    compareFields: ['descricao'],
                    trimStrings: true,
                    caseSensitive: false
                }
            );
        }

        // Comparar grupos
        if (sqliteData.grupos && firebirdData.grupos) {
            results.grupos = this.compare(
                sqliteData.grupos,
                firebirdData.grupos,
                {
                    keyField: 'id',
                    compareFields: ['descricao', 'secao_id'],
                    trimStrings: true,
                    caseSensitive: false
                }
            );
        }

        // Comparar subgrupos
        if (sqliteData.subgrupos && firebirdData.subgrupos) {
            results.subgrupos = this.compare(
                sqliteData.subgrupos,
                firebirdData.subgrupos,
                {
                    keyField: 'id',
                    compareFields: ['descricao', 'grupo_id'],
                    trimStrings: true,
                    caseSensitive: false
                }
            );
        }

        return results;
    }
}

module.exports = Comparator;