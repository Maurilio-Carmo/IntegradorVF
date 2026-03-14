// produto/produto-fornecedores.repository.ts
import { Injectable }            from '@nestjs/common';
import { notInArray, sql }       from 'drizzle-orm';
import { DrizzleService }        from '../../../database/drizzle.service';
import { produtoFornecedores }   from '../../../database/schema';

@Injectable()
export class ProdutoFornecedoresRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutoFornecedores(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const f of list) {
        tx.insert(produtoFornecedores)
          .values({
            id:           f.id           ?? null,
            produtoId:    f.produtoId    ?? null,
            fornecedorId: f.fornecedorId ?? null,
            referencia:   f.referencia   ?? '',
            unidade:      f.unidade      ?? '',
            fator:        f.quantidade   ?? f.fator ?? 1,
            nivel:        f.nivel        ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   produtoFornecedores.id,
            set:      {
              produtoId:    sql`excluded.produto_id`,
              fornecedorId: sql`excluded.fornecedor_id`,
              referencia:   sql`excluded.referencia`,
              unidade:      sql`excluded.unidade`,
              fator:        sql`excluded.fator`,
              nivel:        sql`excluded.nivel`,
              updatedAt:    sql`CURRENT_TIMESTAMP`,
            },
            setWhere: notInArray(produtoFornecedores.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
