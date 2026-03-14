// produto/marcas.repository.ts
import { Injectable }          from '@nestjs/common';
import { notInArray, sql }     from 'drizzle-orm';
import { DrizzleService }      from '../../../database/drizzle.service';
import { marcas }              from '../../../database/schema';

@Injectable()
export class MarcasRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarMarcas(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const m of list) {
        tx.insert(marcas)
          .values({
            marcaId:      m.id        ?? null,
            descricaoOld: m.descricao ?? null,
            status:       'S',
          })
          .onConflictDoUpdate({
            target:   marcas.marcaId,
            set:      { descricaoOld: sql`excluded.descricao_old`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(marcas.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
