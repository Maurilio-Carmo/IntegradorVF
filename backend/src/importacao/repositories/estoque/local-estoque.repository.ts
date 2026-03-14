// estoque/local-estoque.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { localEstoque }      from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class LocalEstoqueRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarLocalEstoque(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const l of list) {
        tx.insert(localEstoque)
          .values({
            localId:       l.id            ?? null,
            descricao:     l.descricao     ?? null,
            tipoDeEstoque: l.tipoDeEstoque ?? null,
            bloqueio:      M.bool(l.bloqueio),
            avaria:        M.bool(l.avaria),
            status:        'S',
          })
          .onConflictDoUpdate({
            target:   localEstoque.localId,
            set:      { descricao: sql`excluded.descricao`, bloqueio: sql`excluded.bloqueio`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(localEstoque.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
