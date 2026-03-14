// frente-loja/motivos-desconto.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { motivosDesconto }   from '../../../database/schema';

@Injectable()
export class MotivoDescontoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarMotivosDesconto(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const m of list) {
        tx.insert(motivosDesconto)
          .values({
            motivoId:  m.id        ?? null,
            descricao: m.descricao ?? null,
            status:    'S',
          })
          .onConflictDoUpdate({
            target:   motivosDesconto.motivoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(motivosDesconto.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
