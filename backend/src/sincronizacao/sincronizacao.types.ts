// backend/src/sincronizacao/sincronizacao.types.ts

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface ResultadoSync {
  criados:     number;
  atualizados: number;
  deletados:   number;
  erros:       number;
  total:       number;
}

export interface CredencialSync {
  urlApi:   string;
  tokenApi: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Timeout por chamada HTTP individual à API externa (ms) */
export const API_TIMEOUT_MS = 15_000;

/**
 * Número máximo de registros enviados em paralelo por execução.
 * Evita sobrecarregar a API externa e bloquear o event loop do Node.
 */
export const CONCORRENCIA_MAX = 5;
