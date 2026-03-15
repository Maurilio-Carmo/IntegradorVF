// backend/src/importacao/repositories/fiscal/tabelas-tributarias.repository.ts
//
// ─── ALTERAÇÃO ────────────────────────────────────────────────────────────────
//
// Adicionado processamento dos itens (destinos por UF) aninhados na API.
// A API retorna:
//   { id, tipoDeOperacao, itens: [ { tabelaTributacaoId, uf, classificacaoDePessoa, ... } ] }
//
// Fluxo por tabela:
//   1. Upsert da tabela pai  → tabelas_tributarias
//   2. DELETE dos itens com status permitido (remove itens que sumiram da API)
//   3. Para cada item em t.itens[]: INSERT + UPDATE condicional → tabelas_tributarias_itens
//
// Estratégia de sync de itens: DELETE + INSERT dentro da transação.
// Motivo: itens por UF podem ser adicionados/removidos sem alterar a tabela pai.
// Os itens com status C/U/D são preservados pelo WHERE no DELETE.
//
// ──────────────────────────────────────────────────────────────────────────────

import { Injectable }           from '@nestjs/common';
import { and, notInArray, sql } from 'drizzle-orm';
import { DrizzleService }       from '../../../database/drizzle.service';
import {
  tabelasTributarias,
  tabelasTributariasItens,
} from '../../../database/schema';
import { SqliteMapper as M }    from '../../../common/sqlite-mapper';

@Injectable()
export class TabelasTributariasRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarTabelasTributarias(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    let totalItens = 0;

    this.drizzle.db.transaction((tx) => {
      for (const t of list) {
        const tabelaId:     number = t.id         ?? t.tabelaId     ?? null;
        const tipoOperacao: string = t.tipoDeOperacao ?? t.tipoOperacao ?? null;

        if (!tabelaId || !tipoOperacao) continue;

        // ── 1. Upsert da tabela pai ─────────────────────────────────────────
        const dadosPai = {
          regimeEstadualId: t.regimeEstadualId ?? null,
          situacaoFiscalId: t.situacaoFiscalId ?? null,
          figuraFiscalId:   t.figuraFiscalId   ?? null,
          ufOrigem:         t.uf               ?? t.ufOrigem ?? null,
          decreto:          t.decreto          ?? null,
        };

        tx.insert(tabelasTributarias)
          .values({ tabelaId, tipoOperacao, ...dadosPai, status: 'S' })
          .onConflictDoNothing()
          .run();

        tx.update(tabelasTributarias)
          .set({ ...dadosPai, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(and(
            sql`${tabelasTributarias.tabelaId} = ${tabelaId}`,
            sql`${tabelasTributarias.tipoOperacao} = ${tipoOperacao}`,
            notInArray(tabelasTributarias.status, ['C', 'U', 'D']),
          ))
          .run();

        // ── 2. Processar itens (destinos por UF) ───────────────────────────
        const itens: any[] = t.itens ?? [];
        if (itens.length === 0) continue;

        // Remover itens antigos com status permitido (não protegidos)
        tx.delete(tabelasTributariasItens)
          .where(and(
            sql`${tabelasTributariasItens.tabelaId} = ${tabelaId}`,
            sql`${tabelasTributariasItens.tipoOperacao} = ${tipoOperacao}`,
            notInArray(tabelasTributariasItens.status, ['C', 'U', 'D']),
          ))
          .run();

        for (const item of itens) {
          const uf                    = item.uf                    ?? null;
          const classificacaoDePessoa = item.classificacaoDePessoa ?? null;

          if (!uf || !classificacaoDePessoa) continue;

          const dadosItem = {
            cfopId:               item.cfopId               ?? null,
            cfopCuponsFiscaisId:  item.cfopCuponsFiscaisId  ?? null,
            cstId:                item.cstId                ?? null,
            tributacao:           item.tributacao            ?? null,
            // Valores NF
            tributadoNF:          item.tributadoNF          ?? 0,
            isentoNF:             item.isentoNF             ?? 0,
            outrosNF:             item.outrosNF             ?? 0,
            tributadoICMS:        item.tributadoICMS        ?? 0,
            // ICMS
            aliquota:             item.aliquota             ?? 0,
            aliquotaInterna:      item.aliquotaInterna      ?? 0,
            agregado:             item.agregado             ?? 0,
            reducaoOrigem:        item.reducaoOrigem        ?? 0,
            icmsOrigem:           item.icmsOrigem           ?? 0,
            cargaLiquida:         item.cargaLiquida         ?? 0,
            // Flags
            somaIpiNaBase:        M.bool(item.somaIPINaBaseDeCalculo),
            somaIpiNaBaseST:      M.bool(item.somaIPINaBaseDeCalculoSubstituicao),
            stDestacado:          M.bool(item.stDestacado),
            icmsDesonerado:       M.bool(item.icmsDesonerado),
            icmsEfetivo:          M.bool(item.icmsEfetivo),
            // Benefício
            codigoBeneficioFiscal: item.codigoBeneficioFiscal ?? null,
            motivoDesoneracaoICMS: item.motivoDesoneracaoICMS  ?? null,
          };

          tx.insert(tabelasTributariasItens)
            .values({
              tabelaId,
              tipoOperacao,
              uf,
              classificacaoDePessoa,
              ...dadosItem,
              status: 'S',
            })
            .onConflictDoNothing()
            .run();

          // Mesmo após DELETE+INSERT, pode haver conflito se status era protegido
          // O UPDATE garante que os dados são atualizados nesses casos
          tx.update(tabelasTributariasItens)
            .set({ ...dadosItem, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(and(
              sql`${tabelasTributariasItens.tabelaId} = ${tabelaId}`,
              sql`${tabelasTributariasItens.tipoOperacao} = ${tipoOperacao}`,
              sql`${tabelasTributariasItens.uf} = ${uf}`,
              sql`${tabelasTributariasItens.classificacaoDePessoa} = ${classificacaoDePessoa}`,
              notInArray(tabelasTributariasItens.status, ['C', 'U', 'D']),
            ))
            .run();

          totalItens++;
        }
      }
    });

    return { success: true, count: list.length, itens: totalItens };
  }
}
