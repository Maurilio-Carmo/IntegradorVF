// fiscal/situacoes-fiscais.repository.ts
import { Injectable }         from '@nestjs/common';
import { notInArray, sql }    from 'drizzle-orm';
import { DrizzleService }     from '../../../database/drizzle.service';
import { situacoesFiscais }   from '../../../database/schema';
import { SqliteMapper as M }  from '../../../common/sqlite-mapper';

@Injectable()
export class SituacoesFiscaisRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarSituacoesFiscais(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const s of list) {
        tx.insert(situacoesFiscais)
          .values({
            situacaoId:        s.id                ?? null,
            descricao:         s.descricao         ?? null,
            descricaoCompleta: s.descricaoCompleta ?? null,
            substituto:        M.bool(s.substituto),
            status:            'U',
          })
          .onConflictDoUpdate({
            target:   situacoesFiscais.situacaoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(situacoesFiscais.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
