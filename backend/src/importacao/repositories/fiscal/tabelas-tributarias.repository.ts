// fiscal/tabelas-tributarias.repository.ts
import { Injectable }           from '@nestjs/common';
import { notInArray, sql }      from 'drizzle-orm';
import { DrizzleService }       from '../../../database/drizzle.service';
import { tabelasTributarias }   from '../../../database/schema';

@Injectable()
export class TabelasTributariasRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarTabelasTributarias(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const t of list) {
        tx.insert(tabelasTributarias)
          .values({
            tabelaId:          t.id               ?? null,
            tipoOperacao:      t.tipoDeOperacao   ?? null,
            regimeEstadualId:  t.regimeEstadualId ?? null,
            situacaoFiscalId:  t.situacaoFiscalId ?? null,
            figuraFiscalId:    t.figuraFiscalId   ?? null,
            ufOrigem:          t.uf               ?? null,
            decreto:           t.decreto          ?? null,
            status:            'S',
          })
          .onConflictDoUpdate({
            target:   [tabelasTributarias.tabelaId, tabelasTributarias.tipoOperacao],
            set:      { decreto: sql`excluded.decreto`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(tabelasTributarias.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
