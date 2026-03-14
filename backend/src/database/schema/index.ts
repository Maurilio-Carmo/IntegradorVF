// backend/src/database/schema/index.ts
// ─── Single source of truth do banco ─────────────────────────────────────────
// ⚠️  Ordem importa: domínios sem dependências cruzadas primeiro.
//     Dentro de cada domínio, o index interno já garante a ordem correta.

export * from './mercadologia';
export * from './controle';
export * from './estoque';
export * from './financeiro';
export * from './fiscal';
export * from './frente-loja';
export * from './pessoa';
export * from './produto';
