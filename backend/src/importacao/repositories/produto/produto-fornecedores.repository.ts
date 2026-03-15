// produto/produto-fornecedores.repository.ts
import { Injectable }            from '@nestjs/common';
import { and, notInArray, sql }  from 'drizzle-orm';
import { DrizzleService }        from '../../../database/drizzle.service';
import { produtoFornecedores }   from '../../../database/schema';

@Injectable()
export class ProdutoFornecedoresRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutoFornecedores(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const f of list) {
        const id = f.id;
        tx.insert(produtoFornecedores)
          .values({
            id,
            produtoId:    f.produtoId    ?? null,
            fornecedorId: f.fornecedorId ?? null,
            referencia:   f.referencia   ?? '',
            unidade:      f.unidade      ?? '',
            fator:        f.quantidade   ?? f.fator ?? 1,
            nivel:        f.nivel        ?? null,
            status:       'S',
          })
          .onConflictDoNothing()
          .run();

        if (!id) continue;

        tx.update(produtoFornecedores)
          .set({
            produtoId:    f.produtoId    ?? null,
            fornecedorId: f.fornecedorId ?? null,
            referencia:   f.referencia   ?? '',
            unidade:      f.unidade      ?? '',
            fator:        f.quantidade   ?? f.fator ?? 1,
            nivel:        f.nivel        ?? null,
            updatedAt:    sql`CURRENT_TIMESTAMP`,
          })
          .where(
            and(
              sql`${produtoFornecedores.id} = ${id}`,
              notInArray(produtoFornecedores.status, ['C', 'U', 'D']),
            ),
          )
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}