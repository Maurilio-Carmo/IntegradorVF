// backend/src/importacao/repositories/estoque.repository.ts

import { Injectable } from '@nestjs/common';
import { SqliteService } from '../../database/sqlite.service';
import { SqliteMapper as M } from '../../common/sqlite-mapper';

/**
 * EstoqueRepository
 * Gerencia: local_estoque, tipos_ajustes e saldo_estoque.
 * Porta direta de estoque.js — lógica SQL preservada integralmente.
 */
@Injectable()
export class EstoqueRepository {

  constructor(private readonly sqlite: SqliteService) {}

  private upsert(
    items: any[],
    sql: string,
    mapper: (item: any) => Record<string, any>,
  ): { success: boolean; count: number } {
    if (!items?.length) return { success: true, count: 0 };

    const stmt = this.sqlite.getDb().prepare(sql);
    this.sqlite.transaction(() => {
      for (const item of items) stmt.run(mapper(item));
    });

    return { success: true, count: items.length };
  }

  // ─── LOCAL DE ESTOQUE ─────────────────────────────────────────────────────

  importarLocalEstoque(locais: any[]) {
    return this.upsert(
      locais,
      `INSERT INTO local_estoque (
         local_id, descricao, tipo_de_estoque, bloqueio, avaria, status
       ) VALUES (
         @local_id, @descricao, @tipo_de_estoque, @bloqueio, @avaria, @status
       )
       ON CONFLICT(local_id) DO UPDATE SET
         descricao       = excluded.descricao,
         tipo_de_estoque = excluded.tipo_de_estoque,
         bloqueio        = excluded.bloqueio,
         avaria          = excluded.avaria,
         updated_at      = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (l) => ({
        local_id:        l.id              ?? null,
        descricao:       l.descricao       ?? null,
        tipo_de_estoque: l.tipoDeEstoque   ?? null,
        bloqueio:        M.bool(l.bloqueio),
        avaria:          M.bool(l.avaria),
        status:          'U',
      }),
    );
  }

  // ─── TIPOS DE AJUSTES ─────────────────────────────────────────────────────

  importarTiposAjustes(tipos: any[]) {
    return this.upsert(
      tipos,
      `INSERT INTO tipos_ajustes (
         ajuste_id, descricao, tipo, tipo_de_operacao, tipo_reservado, status
       ) VALUES (
         @ajuste_id, @descricao, @tipo, @tipo_de_operacao, @tipo_reservado, @status
       )
       ON CONFLICT(ajuste_id) DO UPDATE SET
         descricao        = excluded.descricao,
         tipo             = excluded.tipo,
         tipo_de_operacao = excluded.tipo_de_operacao,
         tipo_reservado   = excluded.tipo_reservado,
         updated_at       = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (t) => ({
        ajuste_id:        t.id             ?? null,
        descricao:        t.descricao      ?? null,
        tipo:             t.tipo           ?? null,
        tipo_de_operacao: t.tipoDeOperacao ?? null,
        tipo_reservado:   t.tipoReservado  ?? null,
        status:           'U',
      }),
    );
  }

  // ─── SALDO DE ESTOQUE ─────────────────────────────────────────────────────

  importarSaldoEstoque(saldos: any[]) {
    return this.upsert(
      saldos,
      `INSERT INTO saldo_estoque (
         saldo_id, loja_id, produto_id, local_id,
         saldo, criado_em, atualizado_em, status
       ) VALUES (
         @saldo_id, @loja_id, @produto_id, @local_id,
         @saldo, @criado_em, @atualizado_em, @status
       )
       ON CONFLICT(saldo_id) DO UPDATE SET
         loja_id       = excluded.loja_id,
         produto_id    = excluded.produto_id,
         local_id      = excluded.local_id,
         saldo         = excluded.saldo,
         atualizado_em = excluded.atualizado_em,
         updated_at    = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (s) => ({
        saldo_id:      s.id              ?? null,
        loja_id:       s.lojaId         ?? null,
        produto_id:    s.produtoId      ?? null,
        local_id:      s.localId        ?? null,
        saldo:         M.num(s.saldo),
        criado_em:     M.date(s.criadoEm),
        atualizado_em: M.date(s.atualizadoEm),
        status:        'U',
      }),
    );
  }
}
