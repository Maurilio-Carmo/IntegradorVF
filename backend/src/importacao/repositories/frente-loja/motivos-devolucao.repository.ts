// frente-loja/motivos-devolucao.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { motivosDevolucao }  from '../../../database/schema';

@Injectable()
export class MotivosDevolucaoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarMotivosDevolucao(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const m of list) {
        tx.insert(motivosDevolucao)
          .values({
            motivoId:  m.id        ?? null,
            descricao: m.descricao ?? null,
            status:    'S',
          })
          .onConflictDoUpdate({
            target:   motivosDevolucao.motivoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(motivosDevolucao.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
