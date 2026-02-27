// backend/src/comparator/comparator.service.ts
import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../logger/logger.service';

/**
 * Serviço de comparação entre dois datasets (SQLite ↔ Firebird ou qualquer fonte).
 * Porta direta de backend/src/modules/comparator/comparator.js.
 * Detecta inclusões (toCreate), alterações (toUpdate) e exclusões (toDelete).
 */
@Injectable()
export class ComparatorService {

  constructor(private readonly logger: AppLoggerService) {}

  compare(sourceData: any[], targetData: any[], options: CompareOptions = {}) {
    const {
      keyField      = 'id',
      compareFields = [],
      caseSensitive = false,
      trimStrings   = true,
    } = options;

    this.logger.info(
      `🔍 Comparando: ${sourceData.length} origem vs ${targetData.length} destino`
    );

    const result: CompareResult = {
      summary: {
        sourceTotal:     sourceData.length,
        targetTotal:     targetData.length,
        toCreate:        0,
        toUpdate:        0,
        toDelete:        0,
        unchanged:       0,
        processingTimeMs: 0,
      },
      toCreate:  [],
      toUpdate:  [],
      toDelete:  [],
      unchanged: [],
    };

    const start     = Date.now();
    const sourceMap = this.buildMap(sourceData, keyField, options);
    const targetMap = this.buildMap(targetData, keyField, options);

    // Registros no target ausentes no source → precisam ser CRIADOS na source
    for (const [key, targetItem] of targetMap) {
      const sourceItem = sourceMap.get(key);
      if (!sourceItem) {
        result.toCreate.push(targetItem);
      } else {
        const diff = this.findDifferences(sourceItem, targetItem, compareFields, options);
        if (diff.length > 0) {
          result.toUpdate.push({ ...targetItem, _changes: diff });
        } else {
          result.unchanged.push(targetItem);
        }
      }
    }

    // Registros no source ausentes no target → precisam ser DELETADOS
    for (const [key, sourceItem] of sourceMap) {
      if (!targetMap.has(key)) {
        result.toDelete.push(sourceItem);
      }
    }

    // Atualiza sumário
    result.summary.toCreate        = result.toCreate.length;
    result.summary.toUpdate        = result.toUpdate.length;
    result.summary.toDelete        = result.toDelete.length;
    result.summary.unchanged       = result.unchanged.length;
    result.summary.processingTimeMs = Date.now() - start;

    this.logger.info('📊 Comparação concluída', result.summary);
    return result;
  }

  private buildMap(data: any[], keyField: string, opts: CompareOptions): Map<string, any> {
    const map = new Map<string, any>();
    for (const item of data) {
      const key = this.normalizeKey(item[keyField], opts);
      map.set(key, item);
    }
    return map;
  }

  private normalizeKey(value: any, opts: CompareOptions): string {
    let str = String(value ?? '');
    if (opts.trimStrings)    str = str.trim();
    if (!opts.caseSensitive) str = str.toLowerCase();
    return str;
  }

  private findDifferences(source: any, target: any, fields: string[], opts: CompareOptions): string[] {
    const fieldsToCheck = fields.length > 0
      ? fields
      : [...new Set([...Object.keys(source), ...Object.keys(target)])];

    return fieldsToCheck.filter(f => {
      let sv = String(source[f] ?? '');
      let tv = String(target[f] ?? '');
      if (opts.trimStrings)    { sv = sv.trim();        tv = tv.trim(); }
      if (!opts.caseSensitive) { sv = sv.toLowerCase(); tv = tv.toLowerCase(); }
      return sv !== tv;
    });
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CompareOptions {
  keyField?:       string;
  compareFields?:  string[];
  caseSensitive?:  boolean;
  trimStrings?:    boolean;
}

interface CompareResult {
  summary:   Record<string, number>;
  toCreate:  any[];
  toUpdate:  any[];
  toDelete:  any[];
  unchanged: any[];
}
