// backend/src/database/schema/fiscal/tipos-operacoes-cfops.schema.ts
//
// ─── NOVA TABELA ──────────────────────────────────────────────────────────────
//
// Representa os CFOPs vinculados a um tipo de operação.
// Na API: campo "cfops" dentro de GET /v1/fiscal/operacoes
//
// Estrutura do JSON da API:
//   {
//     id: 15,
//     descricao: "VENDA A VISTA",
//     cfopNoEstado: 5102,
//     cfopForaDoEstado: 6102,
//     cfopExterior: 7102,
//     cfops: [5102, 6102, 7102, 5405]   ← array de integers
//   }
//
// Nota sobre os 3 campos de CFOP no pai (tipos_operacoes):
//   cfopNoEstado, cfopForaDoEstado, cfopExterior → permanecem na tabela pai
//   como "CFOPs principais" (IDs de referência rápida).
//   Esta tabela armazena a lista completa de CFOPs vinculados.
//
// PK composta: (operacaoId, cfopId)
//   → evita duplicatas, garante idempotência no upsert
//
// FK para tipos_operacoes com CASCADE
//
// ──────────────────────────────────────────────────────────────────────────────

import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tiposOperacoes } from './tipos-operacoes.schema';

export const tiposOperacoesCfops = sqliteTable('tipos_operacoes_cfops', {

  // ── Chave composta ──────────────────────────────────────────────────────────
  operacaoId: integer('operacao_id').notNull(),
  cfopId:     integer('cfop_id').notNull(),

  // ── Controle ────────────────────────────────────────────────────────────────
  status:    text('status', { enum: ['C','U','D','E','S'] }).default('S'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),

}, (t) => ({

  // PK: uma operação não pode ter o mesmo CFOP duas vezes
  pk: primaryKey({ columns: [t.operacaoId, t.cfopId] }),

  // FK → tipos_operacoes
  fkOperacao: foreignKey({
    columns:        [t.operacaoId],
    foreignColumns: [tiposOperacoes.operacaoId],
  }).onUpdate('cascade').onDelete('cascade'),

}));

export type TipoOperacaoCfop    = typeof tiposOperacoesCfops.$inferSelect;
export type NovoTipoOperacaoCfop = typeof tiposOperacoesCfops.$inferInsert;
