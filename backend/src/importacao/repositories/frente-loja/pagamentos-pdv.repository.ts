// frente-loja/pagamentos-pdv.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { pagamentosPdv }     from '../../../database/schema';

@Injectable()
export class PagamentosPdvRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarPagamentosPDV(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const p of list) {
        tx.insert(pagamentosPdv)
          .values({
            pagamentoId:  p.id          ?? null,
            descricao:    p.descricao   ?? null,
            categoriaId:  p.categoriaId ?? null,
            lojaId:       p.lojaId      ?? null,
            valorMaximo:  p.valorMaximo ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   pagamentosPdv.pagamentoId,
            set:      { descricao: sql`excluded.descricao`, valorMaximo: sql`excluded.valor_maximo`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(pagamentosPdv.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
