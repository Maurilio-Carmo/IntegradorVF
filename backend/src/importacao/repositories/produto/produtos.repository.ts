// backend/src/importacao/repositories/produto/produtos.repository.ts

import { Injectable }          from '@nestjs/common';
import { notInArray, sql }     from 'drizzle-orm';
import { DrizzleService }      from '../../../database/drizzle.service';
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

  importarProdutos(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const p of list) {
        const produtoId: number = p.id ?? null;

        // 1. Upsert produto pai
        tx.insert(produtos)
          .values({
            produtoId,
            descricao:            p.descricao                   ?? '',
            descricaoReduzida:    p.descricaoReduzida           ?? '',
            secaoId:              p.secaoId                     ?? null,
            grupoId:              p.grupoId                     ?? null,
            subgrupoId:           p.subgrupoId                  ?? null,
            familiaId:            p.familiaId                   ?? null,
            marcaId:              p.marcaId                     ?? null,
            composicao:           p.composicao                  ?? null,
            pesoVariavel:         p.pesoVariavel                ?? null,
            unidadeCompra:        p.unidadeDeCompra             ?? '',
            itensEmbalagem:       p.itensEmbalagem              ?? 1,
            unidadeVenda:         p.unidadeDeVenda              ?? '',
            itensEmbalagemVenda:  p.itensEmbalagemVenda         ?? 1,
            unidadeTransf:        p.unidadeDeTransferencia      ?? null,
            itensEmbalagemTransf: p.itensEmbalagemTransferencia ?? 1,
            pesoBruto:            p.pesoBruto                   ?? 0,
            pesoLiquido:          p.pesoLiquido                 ?? 0,
            rendimentoUnidade:    p.fatorRendimentoUnidade      ?? 0,
            rendimentoCusto:      p.fatorRendimentoCusto        ?? 0,
            tabelaA:              p.tabelaA                     ?? null,
            genero:               p.generoId != null ? String(p.generoId) : null,
            ncm:                  p.nomeclaturaMercosulId       ?? null,
            cest:                 p.cest != null ? String(p.cest) : null,
            situacaoFiscal:       p.situacaoFiscalId            ?? null,
            situacaoFiscalSaida:  p.situacaoFiscalSaidaId       ?? null,
            naturezaImposto:      p.naturezaDeImpostoFederalId  ?? null,
            permiteDesconto:      M.bool(p.permiteDesconto),
            descontoMaximo:       p.descontoMaximo1 ?? p.descontoMaximo ?? 0,
            controlaEstoque:      M.bool(p.controlaEstoque),
            enviaBalanca:         M.bool(p.enviaBalanca),
            descricaoVariavel:    M.bool(p.descricaoVariavel),
            precoVariavel:        M.bool(p.precoVariavel),
            ativoEcommerce:       M.bool(p.ativoNoEcommerce),
            controlaValidade:     M.bool(p.controlaValidade),
            validadeDias:         p.validadeMinima ?? 0,
            finalidade:           p.finalidadeProduto           ?? null,
            producao:             p.producao                    ?? null,
            unidadeReferencia:    p.unidadeDeReferencia         ?? null,
            medidaReferencial:    p.medidaReferencial           ?? 1,
            indiceAt:             p.indiceAT                    ?? null,
            foraLinha:            M.bool(p.foraDeLinha),
            dataSaida:            p.dataSaida                   ?? null,
            dataInclusao:         M.date(p.dataInclusao),
            dataAlteracao:        M.date(p.dataAlteracao),
            status:               'S',
          })
          .onConflictDoUpdate({
            target: produtos.produtoId,
            set: {
              descricao:         sql`excluded.descricao`,
              descricaoReduzida: sql`excluded.descricao_reduzida`,
              secaoId:           sql`excluded.secao_id`,
              grupoId:           sql`excluded.grupo_id`,
              subgrupoId:        sql`excluded.subgrupo_id`,
              familiaId:         sql`excluded.familia_id`,
              marcaId:           sql`excluded.marca_id`,
              ncm:               sql`excluded.ncm`,
              cest:              sql`excluded.cest`,
              foraLinha:         sql`excluded.fora_linha`,
              dataAlteracao:     sql`excluded.data_alteracao`,
              updatedAt:         sql`CURRENT_TIMESTAMP`,
            },
            setWhere: notInArray(produtos.status, ['C', 'U', 'D']),
          })
          .run();

        if (!produtoId) continue;

        // 2. produto_min_max ← p.estoqueDoProduto[]
        const estoqueDoProduto: any[] = p.estoqueDoProduto ?? [];
        if (estoqueDoProduto.length > 0) {
          tx.delete(produtoMinMax)
            .where(sql`${produtoMinMax.produtoId} = ${produtoId}
              AND ${produtoMinMax.status} NOT IN ('C','U','D')`)
            .run();

          for (const mm of estoqueDoProduto) {
            tx.insert(produtoMinMax)
              .values({
                produtoId,
                lojaId:        mm.lojaId        ?? null,
                estoqueMinimo: mm.estoqueMinimo ?? 0,
                estoqueMaximo: mm.estoqueMaximo ?? 0,
                status:        'S',
              })
              .onConflictDoUpdate({
                target: [produtoMinMax.produtoId, produtoMinMax.lojaId],
                set: {
                  estoqueMinimo: sql`excluded.estoque_minimo`,
                  estoqueMaximo: sql`excluded.estoque_maximo`,
                  updatedAt:     sql`CURRENT_TIMESTAMP`,
                },
                setWhere: notInArray(produtoMinMax.status, ['C','U','D']),
              })
              .run();
          }
        }

        // 3. produto_regimes ← p.regimesDoProduto[]
        const regimesDoProduto: any[] = p.regimesDoProduto ?? [];
        if (regimesDoProduto.length > 0) {
          tx.delete(produtoRegimes)
            .where(sql`${produtoRegimes.produtoId} = ${produtoId}
              AND ${produtoRegimes.status} NOT IN ('C','U','D')`)
            .run();

          for (const r of regimesDoProduto) {
            tx.insert(produtoRegimes)
              .values({
                produtoId,
                lojaId:           r.lojaId           ?? null,
                regimeEstadualId: r.regimeEstadualId ?? null,
                status:           'S',
              })
              .onConflictDoUpdate({
                target: [produtoRegimes.produtoId, produtoRegimes.lojaId],
                set: {
                  regimeEstadualId: sql`excluded.regime_estadual_id`,
                  updatedAt:        sql`CURRENT_TIMESTAMP`,
                },
                setWhere: notInArray(produtoRegimes.status, ['C','U','D']),
              })
              .run();
          }
        }

        // 4. produto_componentes ← p.componentes[]
        const componentes: any[] = p.componentes ?? [];
        if (componentes.length > 0) {
          tx.delete(produtoComponentes)
            .where(sql`${produtoComponentes.produtoId} = ${produtoId}
              AND ${produtoComponentes.status} NOT IN ('C','U','D')`)
            .run();

          for (const c of componentes) {
            tx.insert(produtoComponentes)
              .values({
                produtoId,
                componenteProdutoId: c.produtoId ?? null,
                quantidade:          c.quantidade ?? 1,
                preco1:              c.preco1     ?? 0,
                preco2:              c.preco2     ?? 0,
                preco3:              c.preco3     ?? 0,
                status:              'S',
              })
              .onConflictDoNothing()
              .run();
          }
        }

        // 5. produto_impostos_federais ← p.itensImpostosFederais[]
        const itensImpostosFederais: any[] = p.itensImpostosFederais ?? [];
        if (itensImpostosFederais.length > 0) {
          tx.delete(produtoImpostosFederais)
            .where(sql`${produtoImpostosFederais.produtoId} = ${produtoId}
              AND ${produtoImpostosFederais.status} NOT IN ('C','U','D')`)
            .run();

          for (const imp of itensImpostosFederais) {
            const impostoId: string =
              typeof imp === 'string' ? imp : (imp.id ?? null);
            if (!impostoId) continue;

            tx.insert(produtoImpostosFederais)
              .values({ produtoId, impostoId, status: 'S' })
              .onConflictDoUpdate({
                target: [produtoImpostosFederais.produtoId, produtoImpostosFederais.impostoId],
                set:    { updatedAt: sql`CURRENT_TIMESTAMP` },
                setWhere: notInArray(produtoImpostosFederais.status, ['C','U','D']),
              })
              .run();
          }
        }
      }
    });

    return { success: true, count: list.length };
  }

  /** Retorna todos os produtoIds — usado pelo step de fornecedores por produto. */
  listarIds(): number[] {
    return this.drizzle.db
      .select({ produtoId: produtos.produtoId })
      .from(produtos)
      .all()
      .map((r) => r.produtoId);
  }
}