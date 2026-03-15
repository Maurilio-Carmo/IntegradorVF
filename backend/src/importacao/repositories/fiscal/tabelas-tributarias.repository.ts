// fiscal/tabelas-tributarias.repository.ts

import { Injectable }             from '@nestjs/common';
import { and, notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }         from '../../../database/drizzle.service';
import { tabelasTributarias }     from '../../../database/schema';

@Injectable()
export class TabelasTributariasRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarTabelasTributarias(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const t of list) {
        const tabelaId:     number = t.tabelaId     ?? t.id       ?? null;
        const tipoOperacao: string = t.tipoOperacao ?? t.tipo     ?? null;

        if (!tabelaId || !tipoOperacao) continue;

        tx.insert(tabelasTributarias)
          .values({
            tabelaId:         t.id,
            tipoOperacao:     t.tipoDeOperacao,
            regimeEstadualId: t.regimeEstadualId ?? null,
            situacaoFiscalId: t.situacaoFiscalId ?? null,
            figuraFiscalId:   t.figuraFiscalId   ?? null,
            ufOrigem:         t.uf               ?? null,
            decreto:          t.decreto          ?? null,
            status:           'S',
          })
          .onConflictDoNothing()
          .run();

        tx.update(tabelasTributarias)
          .set({
            regimeEstadualId: t.regimeEstadualId ?? null,
            situacaoFiscalId: t.situacaoFiscalId ?? null,
            figuraFiscalId:   t.figuraFiscalId   ?? null,
            ufOrigem:         t.ufOrigem         ?? null,
            decreto:          t.decreto          ?? null,
            updatedAt:        sql`CURRENT_TIMESTAMP`,
          })
          .where(
            and(
              sql`${tabelasTributarias.tabelaId} = ${tabelaId}`,
              sql`${tabelasTributarias.tipoOperacao} = ${tipoOperacao}`,
              notInArray(tabelasTributarias.status, ['C', 'U', 'D']),
            ),
          )
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}