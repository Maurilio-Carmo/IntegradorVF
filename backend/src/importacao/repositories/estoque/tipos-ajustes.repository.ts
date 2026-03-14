// estoque/tipos-ajustes.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { tiposAjustes }      from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class TiposAjustesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarTiposAjustes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const t of list) {
        tx.insert(tiposAjustes)
          .values({
            ajusteId:       t.id             ?? null,
            descricao:      t.descricao      ?? null,
            tipo:           t.tipo           ?? null,
            tipoDeOperacao: t.tipoDeOperacao ?? null,
            tipoReservado:  M.bool(t.tipoReservado),
            status:         'S',
          })
          .onConflictDoUpdate({
            target:   tiposAjustes.ajusteId,
            set:      { descricao: sql`excluded.descricao`, tipo: sql`excluded.tipo`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(tiposAjustes.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
