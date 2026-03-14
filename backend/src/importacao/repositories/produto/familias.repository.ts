// produto/familias.repository.ts
import { Injectable }          from '@nestjs/common';
import { notInArray, sql }     from 'drizzle-orm';
import { DrizzleService }      from '../../../database/drizzle.service';
import { familias }            from '../../../database/schema';

@Injectable()
export class FamiliasRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarFamilias(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const f of list) {
        tx.insert(familias)
          .values({
            familiaId:    f.id        ?? null,
            descricaoOld: f.descricao ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   familias.familiaId,
            set:      { descricaoOld: sql`excluded.descricao_old`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(familias.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
