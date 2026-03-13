// financeiro/contas-correntes.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { contasCorrentes }   from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class ContasCorrentesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarContasCorrentes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const c of list) {
        tx.insert(contasCorrentes)
          .values({
            contaId:                    c.id                                         ?? null,
            descricao:                  c.descricao                                  ?? null,
            tipo:                       c.tipo                                       ?? null,
            ativa:                      M.bool(c.ativa),
            compoeFluxoCaixa:           M.bool(c.compoeFluxoDeCaixa),
            lancamentoConsolidado:      M.bool(c.lancamentoConsolidadoLiquidacaoMultipla),
            lojaId:                     c.lojaId                                     ?? null,
            nomeLoja:                   c.nomeLoja                                   ?? null,
            agenteFinanceiroId:         c.agenteFinanceiroId                         ?? null,
            nomeBanco:                  c.nomeBanco                                  ?? null,
            codigoBanco:                c.codigoBanco                                ?? null,
            agencia:                    c.agencia                                    ?? null,
            conta:                      c.conta                                      ?? null,
            localPagamento:             c.localDePagamento                           ?? null,
            identificacaoOfx:           c.identificacaoContaCorrenteOFX              ?? null,
            status:                     'U',
          })
          .onConflictDoUpdate({
            target:   contasCorrentes.contaId,
            set:      { descricao: sql`excluded.descricao`, ativa: sql`excluded.ativa`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(contasCorrentes.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
