// produto/produto-min-max.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { produtoMinMax }     from '../../../database/schema';

@Injectable()
export class ProdutoMinMaxRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutoMinMax(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const p of list) {
        tx.insert(produtoMinMax)
          .values({
            produtoId:      p.produtoId     ?? null,
            lojaId:         p.lojaId        ?? null,
            estoqueMinimo:  p.estoqueMinimo ?? 0,
            estoqueMaximo:  p.estoqueMaximo ?? 0,
            status:         'S',
          })
          .onConflictDoUpdate({
            target:   [produtoMinMax.produtoId, produtoMinMax.lojaId],
            set:      {
              estoqueMinimo: sql`excluded.estoque_minimo`,
              estoqueMaximo: sql`excluded.estoque_maximo`,
              updatedAt:     sql`CURRENT_TIMESTAMP`,
            },
            setWhere: notInArray(produtoMinMax.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
