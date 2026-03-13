// produto/produto-regimes.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { produtoRegimes }    from '../../../database/schema';

@Injectable()
export class ProdutoRegimesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutoRegimes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const r of list) {
        tx.insert(produtoRegimes)
          .values({
            produtoId:        r.produtoId        ?? null,
            lojaId:           r.lojaId           ?? null,
            regimeEstadualId: r.regimeEstadualId ?? null,
            status:           'U',
          })
          .onConflictDoUpdate({
            target:   [produtoRegimes.produtoId, produtoRegimes.lojaId],
            set:      {
              regimeEstadualId: sql`excluded.regime_estadual_id`,
              updatedAt:        sql`CURRENT_TIMESTAMP`,
            },
            setWhere: notInArray(produtoRegimes.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
