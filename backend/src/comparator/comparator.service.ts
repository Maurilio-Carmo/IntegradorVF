// backend/src/comparator/comparator.service.ts
import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../logger/logger.service';

/**
 * Porta direta de backend/src/modules/comparator/comparator.js.
 * Detecta inclusões (toCreate), alterações (toUpdate) e exclusões (toDelete)
 * entre dois datasets. Não acessa API nem interface — baixo acoplamento.
 */
@Injectable()
export class ComparatorService {

  constructor(private readonly logger: AppLoggerService) {}

  compare(sourceData: any[], targetData: any[], options: CompareOptions = {}): CompareResult {
    const {
      keyField      = 'id',
      compareFields = [],
      caseSensitive = false,
      trimStrings   = true,
    } = options;

    // CORREÇÃO: segundo argumento de info() deve ser string (módulo), não objeto
    this.logger.info(
      `🔍 Comparando: ${sourceData.length} origem vs ${targetData.length} destino`,
      'Comparator',
    );

    const result: CompareResult = {
      summary: {
        sourceTotal:      sourceData.length,
        targetTotal:      targetData.length,
        toCreate:         0,
        toUpdate:         0,
        toDelete:         0,
        unchanged:        0,
        processingTimeMs: 0,
      },
      toCreate:  [],
      toUpdate:  [],
      toDelete:  [],
      unchanged: [],
    };

    const start     = Date.now();
    const opts      = { keyField, compareFields, caseSensitive, trimStrings };
    const sourceMap = this.buildMap(sourceData, keyField, opts);
    const targetMap = this.buildMap(targetData, keyField, opts);

    // Registros no target → verificar se existem no source
    for (const [key, targetItem] of targetMap) {
      const sourceItem = sourceMap.get(key);
      if (!sourceItem) {
        result.toCreate.push(targetItem);
      } else {
        const diff = this.findDifferences(sourceItem, targetItem, compareFields, opts);
        if (diff.length > 0) {
          result.toUpdate.push({ ...targetItem, _changes: diff });
        } else {
          result.unchanged.push(targetItem);
        }
      }
    }

    // Registros no source ausentes no target → deletar
    for (const [key, sourceItem] of sourceMap) {
      if (!targetMap.has(key)) {
        result.toDelete.push(sourceItem);
      }
    }

    result.summary.toCreate         = result.toCreate.length;
    result.summary.toUpdate         = result.toUpdate.length;
    result.summary.toDelete         = result.toDelete.length;
    result.summary.unchanged        = result.unchanged.length;
    result.summary.processingTimeMs = Date.now() - start;

    // CORREÇÃO: passar summary como terceiro argumento (detalhes), não segundo
    this.logger.info('📊 Comparação concluída', 'Comparator', result.summary);

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

// ─── Interfaces ───────────────────────────────────────────────────────────────

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