// produto/produto-impostos-federais.repository.ts
import { Injectable }              from '@nestjs/common';
import { notInArray, sql }         from 'drizzle-orm';
import { DrizzleService }          from '../../../database/drizzle.service';
import { produtoImpostosFederais } from '../../../database/schema';

@Injectable()
export class ProdutoImpostosFederaisRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutoImpostosFederais(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const p of list) {
        tx.insert(produtoImpostosFederais)
          .values({
            produtoId:  p.produtoId  ?? null,
            impostoId:  p.impostoId  ?? null,
            status:     'S',
          })
          .onConflictDoUpdate({
            target:   [produtoImpostosFederais.produtoId, produtoImpostosFederais.impostoId],
            set:      { updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(produtoImpostosFederais.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
