// frente-loja/motivos-cancelamento.repository.ts
import { Injectable }            from '@nestjs/common';
import { notInArray, sql }       from 'drizzle-orm';
import { DrizzleService }        from '../../../database/drizzle.service';
import { motivosCancelamento }   from '../../../database/schema';

@Injectable()
export class MotivosCancelamentoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarMotivosCancelamento(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const m of list) {
        tx.insert(motivosCancelamento)
          .values({
            motivoId:  m.id        ?? null,
            descricao: m.descricao ?? null,
            status:    'S',
          })
          .onConflictDoUpdate({
            target:   motivosCancelamento.motivoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(motivosCancelamento.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
