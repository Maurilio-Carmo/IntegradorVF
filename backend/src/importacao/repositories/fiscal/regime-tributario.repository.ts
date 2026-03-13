// fiscal/regime-tributario.repository.ts
import { Injectable }         from '@nestjs/common';
import { notInArray, sql }    from 'drizzle-orm';
import { DrizzleService }     from '../../../database/drizzle.service';
import { regimeTributario }   from '../../../database/schema';
import { SqliteMapper as M }  from '../../../common/sqlite-mapper';

@Injectable()
export class RegimeTributarioRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarRegimeTributario(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const r of list) {
        tx.insert(regimeTributario)
          .values({
            regimeId:      r.id             ?? null,
            descricao:     r.descricao      ?? null,
            classificacao: r.classificacao  ?? null,
            loja:          M.bool(r.loja),
            fornecedor:    M.bool(r.fornecedor),
            status:        'U',
          })
          .onConflictDoUpdate({
            target:   regimeTributario.regimeId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(regimeTributario.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
