// produto/produto-auxiliares.repository.ts
import { Injectable }           from '@nestjs/common';
import { notInArray, sql }      from 'drizzle-orm';
import { DrizzleService }       from '../../../database/drizzle.service';
import { produtoAuxiliares }    from '../../../database/schema';
import { SqliteMapper as M }    from '../../../common/sqlite-mapper';

@Injectable()
export class ProdutoAuxiliaresRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutoAuxiliares(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const a of list) {
        tx.insert(produtoAuxiliares)
          .values({
            codigoId:     a.id          ?? null,
            produtoId:    a.produtoId   ?? null,
            fator:        a.fator       ?? 1,
            eanTributado: M.bool(a.eanTributado),
            tipo:         a.tipo        ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   produtoAuxiliares.codigoId,
            set:      {
              produtoId:    sql`excluded.produto_id`,
              fator:        sql`excluded.fator`,
              eanTributado: sql`excluded.ean_tributado`,
              tipo:         sql`excluded.tipo`,
              updatedAt:    sql`CURRENT_TIMESTAMP`,
            },
            setWhere: notInArray(produtoAuxiliares.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
