// estoque/saldo-estoque.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { saldoEstoque }      from '../../../database/schema';

@Injectable()
export class SaldoEstoqueRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarSaldoEstoque(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const s of list) {
        tx.insert(saldoEstoque)
          .values({
            produtoId: s.produtoId ?? null,
            localId:   s.localId   ?? null,
            lojaId:    s.lojaId    ?? null,
            saldo:     s.saldo     ?? 0,
            status:    'S',
          })
          .onConflictDoUpdate({
            target:   [saldoEstoque.produtoId, saldoEstoque.localId, saldoEstoque.lojaId],
            set:      { saldo: sql`excluded.saldo`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(saldoEstoque.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
