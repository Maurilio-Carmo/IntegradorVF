// fiscal/cenarios-fiscais.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { cenariosFiscais }   from '../../../database/schema';

@Injectable()
export class CenariosFiscaisRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarCenariosFiscais(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const c of list) {
        tx.insert(cenariosFiscais)
          .values({
            cenarioId: c.id         ?? null,
            descricao: c.descricao  ?? null,
            cst:       c.cst        ?? null,
            cclasstrib: c.cclasstrib ?? null,
            status:    'U',
          })
          .onConflictDoUpdate({
            target:   cenariosFiscais.cenarioId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(cenariosFiscais.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
