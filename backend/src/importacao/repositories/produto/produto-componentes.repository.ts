// backend/src/importacao/repositories/produto/produto-componentes.repository.ts
import { Injectable }         from '@nestjs/common';
import { sql }                from 'drizzle-orm';
import { DrizzleService }     from '../../../database/drizzle.service';
import { produtoComponentes } from '../../../database/schema';

@Injectable()
export class ProdutoComponentesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutoComponentes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const c of list) {
        tx.insert(produtoComponentes)
          .values({
            produtoId:          c.produtoId          ?? null,
            componenteProdutoId: c.componenteId      ?? null, // campo real do schema
            quantidade:         c.quantidade         ?? 1,
            status:             'U',
          })
          .onConflictDoNothing()
          .run();

        tx.update(produtoComponentes)
          .set({
            quantidade: c.quantidade ?? 1,
            updatedAt:  sql`CURRENT_TIMESTAMP`,
          })
          .where(
            sql`${produtoComponentes.produtoId}           = ${c.produtoId  ?? null}
            AND ${produtoComponentes.componenteProdutoId} = ${c.componenteId ?? null}
            AND ${produtoComponentes.status} NOT IN ('C', 'D')`,
          )
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}