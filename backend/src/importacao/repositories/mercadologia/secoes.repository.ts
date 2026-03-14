// mercadologia/secoes.repository.ts
import { Injectable }          from '@nestjs/common';
import { notInArray, sql }     from 'drizzle-orm';
import { DrizzleService }      from '../../../database/drizzle.service';
import { secoes }              from '../../../database/schema';

@Injectable()
export class SecoesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarSecoes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const s of list) {
        tx.insert(secoes)
          .values({
            secaoId:      s.id        ?? null,
            descricaoOld: s.descricao ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   secoes.secaoId,
            set:      { descricaoOld: sql`excluded.descricao_old`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(secoes.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
