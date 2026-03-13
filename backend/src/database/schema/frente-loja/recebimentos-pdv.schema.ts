// backend/src/database/schema/frente-loja/recebimentos-pdv.schema.ts

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const recebimentosPdv = sqliteTable('recebimentos_pdv', {
  recebimentoId:    integer('recebimento_id').primaryKey(),
  descricao:        text('descricao'),
  categoriaId:      integer('categoria_id'),
  lojaId:           integer('loja_id'),
  tipoRecebimento:  text('tipo_recebimento', { enum: ['PROPRIO','TERCEIRO','TAXA'] }),
  qtdAutenticacoes: integer('qtd_autenticacoes').default(0),
  imprimeDoc:       integer('imprime_doc').default(0),
  qtdImpressoes:    integer('qtd_impressoes').default(0),
  valorRecebimento: real('valor_recebimento').default(0),
  status:           text('status', { enum: ['C','U','D','E','S'] }).default('U'),
  retorno:          text('retorno'),
  createdAt:        text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:        text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type RecebimentoPdv    = typeof recebimentosPdv.$inferSelect;
export type NovoRecebimentoPdv = typeof recebimentosPdv.$inferInsert;
