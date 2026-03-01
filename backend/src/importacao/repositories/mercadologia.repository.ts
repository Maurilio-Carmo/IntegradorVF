// backend/src/importacao/repositories/mercadologia.repository.ts

import { Injectable } from '@nestjs/common';
import { SqliteService } from '../../database/sqlite.service';
import { SqliteMapper as M } from '../../common/sqlite-mapper';

/**
 * MercadologiaRepository
 * Gerencia: seções, grupos e subgrupos (hierarquia mercadológica).
 * Porta direta de mercadologia.js — lógica SQL preservada integralmente.
 */
@Injectable()
export class MercadologiaRepository {

  constructor(private readonly sqlite: SqliteService) {}

  // ─── Método interno de upsert atômico ────────────────────────────────────

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

  // ─── SEÇÕES ───────────────────────────────────────────────────────────────

  importarSecoes(secoes: any[]) {
    return this.upsert(
      secoes,
      `INSERT INTO secoes (secao_id, descricao_old, status)
       VALUES (@secao_id, @descricao_old, 'U')
       ON CONFLICT(secao_id) DO UPDATE SET
         descricao_old = excluded.descricao_old,
         updated_at    = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (s) => ({
        secao_id:     s.id          ?? null,
        descricao_old: s.descricao  ?? null,
      }),
    );
  }

  // ─── GRUPOS ───────────────────────────────────────────────────────────────

  importarGrupos(grupos: any[]) {
    return this.upsert(
      grupos,
      `INSERT INTO grupos (grupo_id, secao_id, descricao_old, status)
       VALUES (@grupo_id, @secao_id, @descricao_old, 'U')
       ON CONFLICT(grupo_id) DO UPDATE SET
         secao_id      = excluded.secao_id,
         descricao_old = excluded.descricao_old,
         updated_at    = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (g) => ({
        grupo_id:     g.id        ?? null,
        secao_id:     g.secaoId   ?? null,
        descricao_old: g.descricao ?? null,
      }),
    );
  }

  // ─── SUBGRUPOS ────────────────────────────────────────────────────────────

  importarSubgrupos(subgrupos: any[]) {
    return this.upsert(
      subgrupos,
      `INSERT INTO subgrupos (subgrupo_id, secao_id, grupo_id, descricao_old, status)
       VALUES (@subgrupo_id, @secao_id, @grupo_id, @descricao_old, 'U')
       ON CONFLICT(subgrupo_id) DO UPDATE SET
         secao_id      = excluded.secao_id,
         grupo_id      = excluded.grupo_id,
         descricao_old = excluded.descricao_old,
         updated_at    = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (s) => ({
        subgrupo_id:   s.id        ?? null,
        secao_id:      s.secaoId   ?? null,
        grupo_id:      s.grupoId   ?? null,
        descricao_old: s.descricao ?? null,
      }),
    );
  }
}
