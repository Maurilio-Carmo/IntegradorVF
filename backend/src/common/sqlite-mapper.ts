// backend/src/common/sqlite-mapper.ts

/**
 * SqliteMapper
 * Porta direta dos helpers estáticos de BaseRepository (CJS).
 * Utilitário puro — sem injeção de dependência, sem imports externos.
 * Usado por todos os repositories NestJS para converter tipos da API → SQLite.
 */
export class SqliteMapper {

  /** Converte boolean → 0 | 1  (SQLite não tem tipo boolean nativo) */
  static bool(val: any): 0 | 1 {
    return val ? 1 : 0;
  }

  /** Garante string ou null */
  static str(val: any): string | null {
    return val != null ? String(val) : null;
  }

  /** Garante number ou null */
  static num(val: any): number | null {
    return val != null ? Number(val) : null;
  }

  /** Extrai apenas a parte da data (sem hora) de strings ISO */
  static date(val: any): string | null {
    return val ? String(val).split('T')[0] : null;
  }

  /** Serializa array de IDs em string separada por ';' */
  static ids(arr: any[]): string | null {
    return Array.isArray(arr) ? arr.map(i => i?.id ?? i).join(';') : null;
  }

  /** Remove caracteres não-numéricos de CEP */
  static cep(val: any): string | null {
    return val ? String(val).replace(/\D/g, '') : null;
  }

  /** Converte para inteiro positivo ou null */
  static int(val: any): number | null {
    const n = parseInt(val, 10);
    return n > 0 ? n : null;
  }
}
