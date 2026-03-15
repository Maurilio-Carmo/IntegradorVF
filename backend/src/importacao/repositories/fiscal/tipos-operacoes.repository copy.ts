// backend/src/importacao/repositories/fiscal/tipos-operacoes.repository.ts
//
// ─── ALTERAÇÃO ────────────────────────────────────────────────────────────────
//
// Adicionado processamento do array "cfops" aninhado na API.
// A API retorna:
//   { id, descricao, cfops: [5102, 6102, 7102], cfopNoEstado: 5102, ... }
//
// Fluxo por operação:
//   1. Upsert da operação pai   → tipos_operacoes
//   2. DELETE dos cfops antigos com status permitido
//   3. Para cada cfopId em t.cfops[]: INSERT → tipos_operacoes_cfops
//
// Os campos cfopNoEstado, cfopForaDoEstado, cfopExterior permanecem na tabela
// pai como referências rápidas — são IDs inteiros conforme documentação da API.
//
// Nota: cfopsRelacionados (TEXT/JSON) foi removido da tabela pai — os dados
// agora vivem normalizados em tipos_operacoes_cfops.
// Se o schema pai ainda tiver cfopsRelacionados, pode manter como campo legado
// ou remover via migration.
//
// ──────────────────────────────────────────────────────────────────────────────

import { Injectable }           from '@nestjs/common';
import { and, notInArray, sql } from 'drizzle-orm';
import { DrizzleService }       from '../../../database/drizzle.service';
import {
  tiposOperacoes,
  tiposOperacoesCfops,
} from '../../../database/schema';
import { SqliteMapper as M }    from '../../../common/sqlite-mapper';

@Injectable()
export class TiposOperacoesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarTiposOperacoes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    let totalCfops = 0;

    this.drizzle.db.transaction((tx) => {
      for (const t of list) {
        const operacaoId: number = t.id ?? t.operacaoId ?? null;
        if (!operacaoId) continue;

        // ── 1. Upsert da operação pai ────────────────────────────────────────
        // cfopNoEstado/ForaDoEstado/Exterior: API retorna como integer (ID do CFOP)
        const dadosPai = {
          descricao:               t.descricao                     ?? null,
          tipoDeOperacao:          t.tipoDeOperacao                ?? null,
          tipoGeracaoFinanceiro:   t.tipoDeGeracaoDeFinanceiro     ?? null,
          modalidade:              t.modalidade                    ?? null,
          tipoDocumento:           t.tipoDocumentoNaOperacao       ?? null,
          origemDaNota:            t.origemDaNota                  ?? null,
          atualizaCustos:          M.bool(t.atualizaCustos),
          atualizaEstoque:         M.bool(t.atualizaEstoque),
          incideImpostosFederais:  M.bool(t.incideImpostosFederais),
          ipiCompoeBasePisCofins:  M.bool(t.ipiCompoeBaseDeCalculoPisCofins),
          outrasDespBasePisCofins: M.bool(t.outrasDespesasCompoeBaseDeCalculoPisCofins),
          outrasDespBaseIcms:      M.bool(t.outrasDespesasCompoeBaseDeCalculoIcms),
          geraFiscal:              M.bool(t.geraFiscal),
          destacaIpi:              M.bool(t.destacaIpiNaVenda),
          destacaIcms:             M.bool(t.destacaICMS),
          compoeAbc:               M.bool(t.compoeABC),
          imprimeDescricaoNfe:     M.bool(t.imprimeDescricaoNfe),
          enviaObservacaoNfe:      M.bool(t.enviaObservacaoNfe),
          utilizaConferencia:      M.bool(t.utilizaConferencia),
          // CFOPs principais (IDs integer conforme API)
          cfopNoEstado:            t.cfopNoEstado     ?? null,
          cfopForaDoEstado:        t.cfopForaDoEstado ?? null,
          cfopExterior:            t.cfopExterior     ?? null,
          observacao:              t.observacao       ?? null,
          codigoCst:               t.codigoDoCst      ?? null,
          // cfopsRelacionados mantido como fallback legado (pode ser null agora)
          cfopsRelacionados:       null,
        };

        tx.insert(tiposOperacoes)
          .values({ operacaoId, ...dadosPai, status: 'S' })
          .onConflictDoNothing()
          .run();

        tx.update(tiposOperacoes)
          .set({ ...dadosPai, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(and(
            sql`${tiposOperacoes.operacaoId} = ${operacaoId}`,
            notInArray(tiposOperacoes.status, ['C', 'U', 'D']),
          ))
          .run();

        // ── 2. Processar CFOPs vinculados ────────────────────────────────────
        const cfops: number[] = Array.isArray(t.cfops) ? t.cfops : [];
        if (cfops.length === 0) continue;

        // Remove CFOPs antigos com status permitido
        tx.delete(tiposOperacoesCfops)
          .where(and(
            sql`${tiposOperacoesCfops.operacaoId} = ${operacaoId}`,
            notInArray(tiposOperacoesCfops.status, ['C', 'U', 'D']),
          ))
          .run();

        for (const cfopId of cfops) {
          if (!cfopId || typeof cfopId !== 'number') continue;

          tx.insert(tiposOperacoesCfops)
            .values({ operacaoId, cfopId, status: 'S' })
            .onConflictDoNothing()
            .run();

          totalCfops++;
        }
      }
    });

    return { success: true, count: list.length, cfops: totalCfops };
  }
}
