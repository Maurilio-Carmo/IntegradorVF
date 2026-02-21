// backend/src/modules/sqlite-repository/repositories/produto.js

const BaseRepository = require('../base-repository');

/**
 * ProdutoRepository
 * Gerencia: marcas, famílias e produtos com mapeamento completo do schema.
 */

class ProdutoRepository extends BaseRepository {

    // ─── MARCAS ───────────────────────────────────────────────────────────────

    static importarMarcas(marcas) {
        return BaseRepository._executarTransacao(
            'marcas',
            marcas,
            (db) => db.prepare(`
                INSERT INTO marcas (
                    marca_id, descricao_old, status
                ) VALUES (
                    @marca_id, @descricao_old, 'U'
                )
                ON CONFLICT(marca_id) DO UPDATE SET
                    descricao_old = excluded.descricao_old,
                    updated_at    = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (m) => [{ marca_id: m.id, descricao_old: m.descricao || null }]
        );
    }

    // ─── FAMÍLIAS ─────────────────────────────────────────────────────────────

    static importarFamilias(familias) {
        return BaseRepository._executarTransacao(
            'famílias',
            familias,
            (db) => db.prepare(`
                INSERT INTO familias (
                    familia_id, descricao_old, status
                ) VALUES (
                    @familia_id, @descricao_old, 'U'
                )
                ON CONFLICT(familia_id) DO UPDATE SET
                    descricao_old = excluded.descricao_old,
                    updated_at    = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (f) => [{ familia_id: f.id, descricao_old: f.descricao || null }]
        );
    }

    // ─── PRODUTOS ─────────────────────────────────────────────────────────────

    /**
     * @param {Array}  produtos - Items vindos da API
     * @param {number} lojaId   - ID da loja para filtrar estoque e regime
     */
    static importarProdutos(produtos, lojaId) {
        return BaseRepository._executarTransacao(
            'produtos',
            produtos,
            (db) => db.prepare(`
                INSERT INTO produtos (
                    produto_id, descricao, descricao_reduzida,
                    secao_id, grupo_id, subgrupo_id, familia_id, marca_id,
                    estoque_minimo, estoque_maximo, composicao, peso_variavel,
                    unidade_compra, itens_embalagem, unidade_venda, itens_embalagem_venda, unidade_transf, itens_embalagem_transf,
                    peso_bruto, peso_liquido, rendimento_unidade, rendimento_custo,
                    tabela_a, genero, ncm, cest,
                    situacao_fiscal, situacao_fiscal_saida,
                    regime_estadual, impostos_federais, natureza_imposto,
                    permite_desconto, desconto_maximo,
                    controla_estoque, envia_balanca, descricao_variavel,
                    preco_variavel, ativo_ecommerce, controla_validade, validade_dias,
                    finalidade, producao,
                    unidade_referencia, medida_referencial, indice_at,
                    fora_linha, data_saida, data_inclusao, data_alteracao, status
                ) VALUES (
                    @produto_id, @descricao, @descricao_reduzida,
                    @secao_id, @grupo_id, @subgrupo_id, @familia_id, @marca_id,
                    @estoque_minimo, @estoque_maximo, @composicao, @peso_variavel,
                    @unidade_compra, @itens_embalagem, @unidade_venda, @itens_embalagem_venda, @unidade_transf, @itens_embalagem_transf,
                    @peso_bruto, @peso_liquido, @rendimento_unidade, @rendimento_custo,
                    @tabela_a, @genero, @ncm, @cest,
                    @situacao_fiscal, @situacao_fiscal_saida,
                    @regime_estadual, @impostos_federais, @natureza_imposto,
                    @permite_desconto, @desconto_maximo,
                    @controla_estoque, @envia_balanca, @descricao_variavel,
                    @preco_variavel, @ativo_ecommerce, @controla_validade, @validade_dias,
                    @finalidade, @producao,
                    @unidade_referencia, @medida_referencial, @indice_at,
                    @fora_linha, @data_saida, @data_inclusao, @data_alteracao, @status
                )
                ON CONFLICT(produto_id) DO UPDATE SET
                    descricao            = excluded.descricao,
                    descricao_reduzida   = excluded.descricao_reduzida,
                    secao_id             = excluded.secao_id,
                    grupo_id             = excluded.grupo_id,
                    subgrupo_id          = excluded.subgrupo_id,
                    familia_id           = excluded.familia_id,
                    marca_id             = excluded.marca_id,
                    estoque_minimo       = excluded.estoque_minimo,
                    estoque_maximo       = excluded.estoque_maximo,
                    composicao           = excluded.composicao,
                    peso_variavel        = excluded.peso_variavel,
                    unidade_compra       = excluded.unidade_compra,
                    itens_embalagem      = excluded.itens_embalagem,
                    unidade_venda        = excluded.unidade_venda,
                    itens_embalagem_venda= excluded.itens_embalagem_venda,
                    unidade_transf       = excluded.unidade_transf,
                    itens_embalagem_transf= excluded.itens_embalagem_transf,
                    peso_bruto           = excluded.peso_bruto,
                    peso_liquido         = excluded.peso_liquido,
                    rendimento_unidade   = excluded.rendimento_unidade,
                    rendimento_custo     = excluded.rendimento_custo,
                    tabela_a             = excluded.tabela_a,
                    ncm                  = excluded.ncm,
                    cest                 = excluded.cest,
                    situacao_fiscal      = excluded.situacao_fiscal,
                    situacao_fiscal_saida= excluded.situacao_fiscal_saida,
                    regime_estadual      = excluded.regime_estadual,
                    impostos_federais    = excluded.impostos_federais,
                    natureza_imposto     = excluded.natureza_imposto,
                    permite_desconto     = excluded.permite_desconto,
                    desconto_maximo      = excluded.desconto_maximo,
                    controla_estoque     = excluded.controla_estoque,
                    envia_balanca        = excluded.envia_balanca,
                    descricao_variavel   = excluded.descricao_variavel,
                    preco_variavel       = excluded.preco_variavel,
                    ativo_ecommerce      = excluded.ativo_ecommerce,
                    controla_validade    = excluded.controla_validade,
                    validade_dias        = excluded.validade_dias,
                    finalidade           = excluded.finalidade,
                    producao             = excluded.producao,
                    unidade_referencia   = excluded.unidade_referencia,
                    medida_referencial   = excluded.medida_referencial,
                    indice_at            = excluded.indice_at,
                    fora_linha        = excluded.fora_de_linha,
                    data_alteracao       = excluded.data_alteracao,
                    updated_at           = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (p) => {
                // Localizar estoque e regime da loja configurada
                const est = (p.estoqueDoProduto || []).find(e => e.lojaId === lojaId) || {};
                const reg = (p.regimesDoProduto  || []).find(r => r.lojaId === lojaId) || {};

                return [{
                    // Identificação
                    produto_id:               p.id                              ?? null,
                    descricao:                p.descricao                       ?? null,
                    descricao_reduzida:       p.descricaoReduzida               ?? null,
                    secao_id:                 p.secaoId                         ?? null,
                    grupo_id:                 p.grupoId                         ?? null,
                    subgrupo_id:              p.subgrupoId                      ?? null,
                    familia_id:               p.familiaId                       ?? null,
                    marca_id:                 p.marcaId                         ?? null,
                    estoque_minimo:           est.estoqueMinimo                 ?? null,
                    estoque_maximo:           est.estoqueMaximo                 ?? null,
                    composicao:               p.composicao                      ?? null,
                    peso_variavel:            p.pesoVariavel                    ?? null,
                    unidade_compra:           p.unidadeDeCompra                 ?? null,
                    itens_embalagem:          p.itensEmbalagem                  ?? 1,
                    unidade_venda:            p.unidadeDeVenda                  ?? null,
                    itens_embalagem_venda:    p.itensEmbalagemVenda             ?? 1,
                    unidade_transf:           p.unidadeDeTransferencia          ?? null,
                    itens_embalagem_transf:   p.itensEmbalagemTransferencia     ?? 1,
                    peso_bruto:               p.pesoBruto                       ?? 0,
                    peso_liquido:             p.pesoLiquido                     ?? 0,
                    rendimento_unidade:       p.fatorRendimentoUnidade          ?? 0,
                    rendimento_custo:         p.fatorRendimentoCusto            ?? 0,
                    tabela_a:                 p.tabelaA                         ?? null,
                    genero:                   p.generoId                        ?? null,
                    ncm:                      p.nomeclaturaMercosulId           ?? null,
                    cest:                     p.cest                            ?? null,
                    situacao_fiscal:          p.situacaoFiscalId                ?? null,
                    situacao_fiscal_saida:    p.situacaoFiscalSaidaId           ?? null,
                    regime_estadual:          reg.regimeEstadualId              ?? null,
                    impostos_federais:        BaseRepository._ids(p.itensImpostosFederais),
                    natureza_imposto:         p.naturezaDeImpostoFederalId      ?? null,
                    permite_desconto:         BaseRepository._bool(p.permiteDesconto),
                    desconto_maximo:          p.descontoMaximo1                 ?? 0,
                    controla_estoque:         BaseRepository._bool(p.controlaEstoque),
                    envia_balanca:            BaseRepository._bool(p.enviaBalanca),
                    descricao_variavel:       BaseRepository._bool(p.descricaoVariavel),
                    preco_variavel:           BaseRepository._bool(p.precoVariavel),
                    ativo_ecommerce:          BaseRepository._bool(p.ativoNoEcommerce),
                    controla_validade:        BaseRepository._bool(p.controlaValidade),
                    validade_dias:            p.validade                        ?? 0,
                    finalidade:               p.finalidadeProduto               ?? null,
                    producao:                 p.producao                        ?? null,
                    unidade_referencia:       p.unidadeDeReferencia             ?? null,
                    medida_referencial:       p.medidaReferencial               ?? 1,
                    indice_at:                p.indiceAT                        ?? null,
                    fora_linha:               p.foraDeLinha === 'S' ? 1 : 0,
                    data_saida:               BaseRepository._date(p.dataSaida),
                    data_inclusao:            BaseRepository._date(p.dataInclusao),
                    data_alteracao:           BaseRepository._date(p.dataAlteracao),
                    status: 'U'
                }];
            }
        );
    }
}

module.exports = ProdutoRepository;