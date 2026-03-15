// fiscal/impostos-federais.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { impostosFederais }  from '../../../database/schema';

@Injectable()
export class ImpostosFederaisRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarImpostosFederais(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const i of list) {
        tx.insert(impostosFederais)
          .values({
            impostoId:                  i.id                         ?? null,
            descricao:                  i.descricao                  ?? null,
            tipo:                       i.tipoImposto                ?? null,
            cstEntradaReal:             i.cstEntradaReal             ?? null,
            cstSaidaReal:               i.cstSaidaReal               ?? null,
            aliquotaEntradaReal:        i.aliquotaEntradaReal        ?? 0,
            aliquotaSaidaReal:          i.aliquotaSaidaReal          ?? 0,
            cstEntradaPresumido:        i.cstEntradaPresumido        ?? null,
            cstSaidaPresumido:          i.cstSaidaPresumido          ?? null,
            aliquotaEntradaPresumido:   i.aliquotaEntradaPresumido   ?? 0,
            aliquotaSaidaPresumido:     i.aliquotaSaidaPresumido     ?? 0,
            cstEntradaSimples:          i.cstEntradaSimples          ?? null,
            cstSaidaSimples:            i.cstSaidaSimples            ?? null,
            status:                     'S',
          })
          .onConflictDoUpdate({
            target:   impostosFederais.impostoId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(impostosFederais.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
