// financeiro/historico-padrao.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { historicoPadrao }   from '../../../database/schema';

@Injectable()
export class HistoricoPadraoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarHistoricoPadrao(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const h of list) {
        tx.insert(historicoPadrao)
          .values({
            historicoId: h.id        ?? null,
            descricao:   h.descricao ?? null,
            status:      'S',
          })
          .onConflictDoUpdate({
            target:   historicoPadrao.historicoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(historicoPadrao.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
