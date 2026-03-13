// frente-loja/formas-pagamento.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { formasPagamento }   from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class FormasPagamentoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarFormasPagamento(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const f of list) {
        tx.insert(formasPagamento)
          .values({
            formaPagamentoId:       f.formaPagamentoId      ?? f.id ?? null,
            descricao:              f.descricao             ?? null,
            especieDeDocumentoId:   f.especieDeDocumentoId  ?? null,
            categoriaFinanceiraId:  f.categoriaFinanceiraId ?? null,
            agenteFinanceiroId:     f.agenteFinanceiroId    ?? null,
            controleDeCartao:       M.bool(f.controleDeCartao),
            movimentaContaCorrente: M.bool(f.movimentaContaCorrente),
            ativa:                  M.bool(f.ativa),
            contaCorrenteId:        f.contaCorrenteId       ?? null,
            status:                 'U',
          })
          .onConflictDoUpdate({
            target:   formasPagamento.formaPagamentoId,
            set:      { descricao: sql`excluded.descricao`, ativa: sql`excluded.ativa`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(formasPagamento.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
