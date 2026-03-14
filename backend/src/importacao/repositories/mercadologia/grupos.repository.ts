// mercadologia/grupos.repository.ts
import { Injectable }          from '@nestjs/common';
import { notInArray, sql }     from 'drizzle-orm';
import { DrizzleService }      from '../../../database/drizzle.service';
import { grupos }              from '../../../database/schema';

@Injectable()
export class GruposRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarGrupos(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const g of list) {
        tx.insert(grupos)
          .values({
            secaoId:      g.secaoId   ?? null,
            grupoId:      g.id        ?? null,
            descricaoOld: g.descricao ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   [grupos.secaoId, grupos.grupoId],
            set:      { descricaoOld: sql`excluded.descricao_old`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(grupos.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
