// fiscal/tipos-operacoes.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { tiposOperacoes }    from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class TiposOperacoesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarTiposOperacoes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const t of list) {
        tx.insert(tiposOperacoes)
          .values({
            operacaoId:              t.id                         ?? null,
            descricao:               t.descricao                  ?? null,
            tipoDeOperacao:          t.tipoDeOperacao             ?? null,
            tipoGeracaoFinanceiro:   t.tipoGeracaoFinanceiro      ?? null,
            modalidade:              t.modalidade                 ?? null,
            tipoDocumento:           t.tipoDocumento              ?? null,
            origemDaNota:            t.origemDaNota               ?? null,
            atualizaCustos:          M.bool(t.atualizaCustos),
            atualizaEstoque:         M.bool(t.atualizaEstoque),
            incideImpostosFederais:  M.bool(t.incideImpostosFederais),
            ipiCompoeBasePisCofins:  M.bool(t.ipiCompoeBasePisCofins),
            outrasDespBasePisCofins: M.bool(t.outrasDespBasePisCofins),
            outrasDespBaseIcms:      M.bool(t.outrasDespBaseIcms),
            geraFiscal:              M.bool(t.geraFiscal),
            destacaIpi:              M.bool(t.destacaIpi),
            destacaIcms:             M.bool(t.destacaIcms),
            compoeAbc:               M.bool(t.compoeAbc),
            cfopNoEstado:            t.cfopNoEstado               ?? null,
            cfopForaDoEstado:        t.cfopForaDoEstado           ?? null,
            cfopExterior:            t.cfopExterior               ?? null,
            observacao:              t.observacao                 ?? null,
            codigoCst:               t.codigoCst                  ?? null,
            status:                  'U',
          })
          .onConflictDoUpdate({
            target:   tiposOperacoes.operacaoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(tiposOperacoes.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
