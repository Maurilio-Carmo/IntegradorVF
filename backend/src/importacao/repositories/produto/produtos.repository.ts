// backend/src/importacao/repositories/produto/produtos.repository.ts

import { Injectable }        from '@nestjs/common';
import { eq, notInArray, sql } from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import {
  produtos,
  produtoMinMax,
  produtoRegimes,
  produtoComponentes,
  produtoImpostosFederais,
} from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class ProdutosRepository {

  constructor(private readonly drizzle: DrizzleService) {}

  // ─── Importação principal ─────────────────────────────────────────────────

  importarProdutos(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const p of list) {
        const produtoId: number = p.id ?? null;

        // ── 1. Upsert do produto pai ────────────────────────────────────────
        tx.insert(produtos)
          .values({
            produtoId,
            descricao:            p.descricao              ?? '',
            descricaoReduzida:    p.descricaoReduzida      ?? '',
            secaoId:              p.secaoId                ?? null,
            grupoId:              p.grupoId                ?? null,
            subgrupoId:           p.subgrupoId             ?? null,
            familiaId:            p.familiaId              ?? null,
            marcaId:              p.marcaId                ?? null,
            composicao:           p.composicao             ?? null,
            pesoVariavel:         p.pesoVariavel           ?? null,
            unidadeCompra:        p.unidadeDeCompra        ?? '',
            itensEmbalagem:       p.itensDeEmbalagem       ?? 1,
            unidadeVenda:         p.unidadeDeVenda         ?? '',
            itensEmbalagemVenda:  p.itensDeEmbalagemVenda  ?? 1,
            unidadeTransf:        p.unidadeDeTransferencia ?? null,
            itensEmbalagemTransf: p.itensDeEmbalagemTransf ?? 1,
            pesoBruto:            p.pesoBruto              ?? 0,
            pesoLiquido:          p.pesoLiquido            ?? 0,
            rendimentoUnidade:    p.rendimentoUnidade      ?? 0,
            rendimentoCusto:      p.rendimentoCusto        ?? 0,
            tabelaA:              p.tabelaA                ?? null,
            genero:               p.genero                 ?? null,
            ncm:                  p.ncm                    ?? null,
            cest:                 p.cest                   ?? null,
            situacaoFiscal:       p.situacaoFiscal         ?? null,
            situacaoFiscalSaida:  p.situacaoFiscalSaida    ?? null,
            naturezaImposto:      p.naturezaImposto        ?? null,
            permiteDesconto:      M.bool(p.permiteDesconto),
            descontoMaximo:       p.descontoMaximo         ?? 0,
            controlaEstoque:      M.bool(p.controlaEstoque),
            enviaBalanca:         M.bool(p.enviaBalanca),
            descricaoVariavel:    M.bool(p.descricaoVariavel),
            precoVariavel:        M.bool(p.precoVariavel),
            ativoEcommerce:       M.bool(p.ativoEcommerce),
            controlaValidade:     M.bool(p.controlaValidade),
            validadeDias:         p.validadeDias           ?? 0,
            finalidade:           p.finalidade             ?? null,
            producao:             p.producao               ?? null,
            unidadeReferencia:    p.unidadeReferencia      ?? null,
            medidaReferencial:    p.medidaReferencial      ?? 1,
            indiceAt:             p.indiceAt               ?? null,
            foraLinha:            M.bool(p.foraLinha),
            dataSaida:            p.dataSaida              ?? null,
            dataInclusao:         M.date(p.dataInclusao),
            dataAlteracao:        M.date(p.dataAlteracao),
            status:               'S',
          })
          .onConflictDoUpdate({
            target: produtos.produtoId,
            set: {
              descricao:            sql`excluded.descricao`,
              descricaoReduzida:    sql`excluded.descricao_reduzida`,
              secaoId:              sql`excluded.secao_id`,
              grupoId:              sql`excluded.grupo_id`,
              subgrupoId:           sql`excluded.subgrupo_id`,
              familiaId:            sql`excluded.familia_id`,
              marcaId:              sql`excluded.marca_id`,
              ncm:                  sql`excluded.ncm`,
              cest:                 sql`excluded.cest`,
              foraLinha:            sql`excluded.fora_linha`,
              dataAlteracao:        sql`excluded.data_alteracao`,
              updatedAt:            sql`CURRENT_TIMESTAMP`,
            },
            // Só sobrescreve se o registro não está com pendência local
            setWhere: notInArray(produtos.status, ['C', 'U', 'D']),
          })
          .run();

        if (!produtoId) continue;

        // ── 2. MinMax (estoques mínimo/máximo por loja) ─────────────────────
        const minMaxList: any[] =
          p.minMax        ??
          p.estoqueMinMax ??
          p.estoque       ?? [];

        if (minMaxList.length > 0) {
          tx.delete(produtoMinMax)
            .where(
              sql`${produtoMinMax.produtoId} = ${produtoId}
              AND ${produtoMinMax.status} NOT IN ('C', 'U', 'D')`,
            )
            .run();

          for (const mm of minMaxList) {
            tx.insert(produtoMinMax)
              .values({
                produtoId,
                lojaId:        mm.lojaId        ?? mm.loja?.id ?? null,
                estoqueMinimo: mm.estoqueMinimo ?? mm.minimo   ?? 0,
                estoqueMaximo: mm.estoqueMaximo ?? mm.maximo   ?? 0,
                status:        'S',
              })
              .onConflictDoUpdate({
                target: [produtoMinMax.produtoId, produtoMinMax.lojaId],
                set: {
                  estoqueMinimo: sql`excluded.estoque_minimo`,
                  estoqueMaximo: sql`excluded.estoque_maximo`,
                  updatedAt:     sql`CURRENT_TIMESTAMP`,
                },
                setWhere: notInArray(produtoMinMax.status, ['C', 'U', 'D']),
              })
              .run();
          }
        }

        // ── 3. Regimes por loja ─────────────────────────────────────────────
        const regimesList: any[] = p.regimes ?? p.regimesFiscais ?? [];

        if (regimesList.length > 0) {
          tx.delete(produtoRegimes)
            .where(
              sql`${produtoRegimes.produtoId} = ${produtoId}
              AND ${produtoRegimes.status} NOT IN ('C', 'U', 'D')`,
            )
            .run();

          for (const r of regimesList) {
            tx.insert(produtoRegimes)
              .values({
                produtoId,
                lojaId:           r.lojaId           ?? r.loja?.id      ?? null,
                regimeEstadualId: r.regimeEstadualId ?? r.regimeId      ?? null,
                status:           'S',
              })
              .onConflictDoUpdate({
                target: [produtoRegimes.produtoId, produtoRegimes.lojaId],
                set: {
                  regimeEstadualId: sql`excluded.regime_estadual_id`,
                  updatedAt:        sql`CURRENT_TIMESTAMP`,
                },
                setWhere: notInArray(produtoRegimes.status, ['C', 'U', 'D']),
              })
              .run();
          }
        }

        // ── 4. Componentes (kit/composto) ───────────────────────────────────
        const componentesList: any[] = p.componentes ?? p.itens ?? [];

        if (componentesList.length > 0) {
          tx.delete(produtoComponentes)
            .where(
              sql`${produtoComponentes.produtoId} = ${produtoId}
              AND ${produtoComponentes.status} NOT IN ('C', 'U', 'D')`,
            )
            .run();

          for (const c of componentesList) {
            tx.insert(produtoComponentes)
              .values({
                produtoId,
                componenteProdutoId: c.componenteId ?? c.produtoComponenteId ?? c.id ?? null,
                quantidade:          c.quantidade   ?? 1,
                preco1:              c.preco1        ?? 0,
                preco2:              c.preco2        ?? 0,
                preco3:              c.preco3        ?? 0,
                status:              'S',
              })
              .onConflictDoNothing()
              .run();
          }
        }

        // ── 5. Impostos Federais ────────────────────────────────────────────
        const impostosList: any[] = p.impostosFederais ?? p.impostos ?? [];

        if (impostosList.length > 0) {
          tx.delete(produtoImpostosFederais)
            .where(
              sql`${produtoImpostosFederais.produtoId} = ${produtoId}
              AND ${produtoImpostosFederais.status} NOT IN ('C', 'U', 'D')`,
            )
            .run();

          for (const imp of impostosList) {
            const impostoId: string =
              typeof imp === 'string' ? imp : (imp.id ?? imp.impostoId ?? String(imp));

            if (!impostoId) continue;

            tx.insert(produtoImpostosFederais)
              .values({ produtoId, impostoId, status: 'S' })
              .onConflictDoUpdate({
                target: [produtoImpostosFederais.produtoId, produtoImpostosFederais.impostoId],
                set:    { updatedAt: sql`CURRENT_TIMESTAMP` },
                setWhere: notInArray(produtoImpostosFederais.status, ['C', 'U', 'D']),
              })
              .run();
          }
        }
      }
    });

    return { success: true, count: list.length };
  }

  // ─── Helper ───────────────────────────────────────────────────────────────

  /** Retorna todos os produtoIds — usado pelo step de fornecedores por produto. */
  listarIds(): number[] {
    return this.drizzle.db
      .select({ produtoId: produtos.produtoId })
      .from(produtos)
      .all()
      .map((r) => r.produtoId);
  }
}