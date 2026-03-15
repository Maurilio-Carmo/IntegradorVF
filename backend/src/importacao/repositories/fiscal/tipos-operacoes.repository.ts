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
            tipoGeracaoFinanceiro:   t.tipoDeGeracaoDeFinanceiro  ?? null,
            modalidade:              t.modalidade                 ?? null,
            tipoDocumento:           t.tipoDocumentoNaOperacao    ?? null,
            origemDaNota:            t.origemDaNota               ?? null,
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
            cfopNoEstado:            t.cfopNoEstado               ?? null,
            cfopForaDoEstado:        t.cfopForaDoEstado           ?? null,
            cfopExterior:            t.cfopExterior               ?? null,
            observacao:              t.observacao                 ?? null,
            codigoCst:               t.codigoDoCst                ?? null,
            status:                  'S',
          })
          .onConflictDoUpdate({
            target:   tiposOperacoes.operacaoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(tiposOperacoes.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
