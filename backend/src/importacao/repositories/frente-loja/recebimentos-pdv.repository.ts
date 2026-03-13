// frente-loja/recebimentos-pdv.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { recebimentosPdv }   from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class RecebimentosPdvRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarRecebimentosPDV(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const r of list) {
        tx.insert(recebimentosPdv)
          .values({
            recebimentoId:    r.id               ?? null,
            descricao:        r.descricao        ?? null,
            categoriaId:      r.categoriaId      ?? null,
            lojaId:           r.lojaId           ?? null,
            tipoRecebimento:  r.tipoRecebimento  ?? null,
            qtdAutenticacoes: r.qtdAutenticacoes ?? 0,
            imprimeDoc:       M.bool(r.imprimeDoc),
            qtdImpressoes:    r.qtdImpressoes    ?? 0,
            status:           'U',
          })
          .onConflictDoUpdate({
            target:   recebimentosPdv.recebimentoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(recebimentosPdv.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
