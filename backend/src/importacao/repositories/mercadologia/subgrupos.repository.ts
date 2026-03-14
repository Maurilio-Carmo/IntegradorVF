// mercadologia/subgrupos.repository.ts
import { Injectable }          from '@nestjs/common';
import { notInArray, sql }     from 'drizzle-orm';
import { DrizzleService }      from '../../../database/drizzle.service';
import { subgrupos }           from '../../../database/schema';

@Injectable()
export class SubgruposRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarSubgrupos(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const s of list) {
        tx.insert(subgrupos)
          .values({
            secaoId:      s.secaoId   ?? null,
            grupoId:      s.grupoId   ?? null,
            subgrupoId:   s.id        ?? null,
            descricaoOld: s.descricao ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   [subgrupos.secaoId, subgrupos.grupoId, subgrupos.subgrupoId],
            set:      { descricaoOld: sql`excluded.descricao_old`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(subgrupos.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
