// produto/produtos.repository.ts
import { Injectable }           from '@nestjs/common';
import { notInArray, sql }      from 'drizzle-orm';
import { DrizzleService }       from '../../../database/drizzle.service';
import { produtos }             from '../../../database/schema';
import { SqliteMapper as M }    from '../../../common/sqlite-mapper';

@Injectable()
export class ProdutosRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarProdutos(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const p of list) {
        tx.insert(produtos)
          .values({
            produtoId:             p.id                     ?? null,
            descricao:             p.descricao              ?? '',
            descricaoReduzida:     p.descricaoReduzida       ?? '',
            secaoId:               p.secaoId                ?? null,
            grupoId:               p.grupoId                ?? null,
            subgrupoId:            p.subgrupoId             ?? null,
            familiaId:             p.familiaId              ?? null,
            marcaId:               p.marcaId                ?? null,
            composicao:            p.composicao             ?? null,
            pesoVariavel:          p.pesoVariavel           ?? null,
            unidadeCompra:         p.unidadeDeCompra        ?? '',
            itensEmbalagem:        p.itensDeEmbalagem       ?? 1,
            unidadeVenda:          p.unidadeDeVenda         ?? '',
            itensEmbalagemVenda:   p.itensDeEmbalagemVenda  ?? 1,
            unidadeTransf:         p.unidadeDeTransferencia ?? null,
            pesoBruto:             p.pesoBruto              ?? 0,
            pesoLiquido:           p.pesoLiquido            ?? 0,
            ncm:                   p.ncm                    ?? null,
            cest:                  p.cest                   ?? null,
            situacaoFiscal:        p.situacaoFiscal         ?? null,
            situacaoFiscalSaida:   p.situacaoFiscalSaida    ?? null,
            naturezaImposto:       p.naturezaImposto        ?? null,
            permiteDesconto:       M.bool(p.permiteDesconto),
            descontoMaximo:        p.descontoMaximo         ?? 0,
            controlaEstoque:       M.bool(p.controlaEstoque),
            enviaBalanca:          M.bool(p.enviaBalanca),
            descricaoVariavel:     M.bool(p.descricaoVariavel),
            precoVariavel:         M.bool(p.precoVariavel),
            ativoEcommerce:        M.bool(p.ativoEcommerce),
            controlaValidade:      M.bool(p.controlaValidade),
            validadeDias:          p.validadeDias           ?? 0,
            finalidade:            p.finalidade             ?? null,
            producao:              p.producao               ?? null,
            genero:                p.genero                 ?? null,
            tabelaA:               p.tabelaA                ?? null,
            status:                'U',
          })
          .onConflictDoUpdate({
            target:   produtos.produtoId,
            set:      {
              descricao:          sql`excluded.descricao`,
              descricaoReduzida:  sql`excluded.descricao_reduzida`,
              ncm:                sql`excluded.ncm`,
              updatedAt:          sql`CURRENT_TIMESTAMP`,
            },
            setWhere: notInArray(produtos.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
