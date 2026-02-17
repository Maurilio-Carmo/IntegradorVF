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
                INSERT INTO marcas (marca_id, descricao_old, status)
                VALUES (@marca_id, @descricao_old, 'U')
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
                INSERT INTO familias (familia_id, descricao_old, status)
                VALUES (@familia_id, @descricao_old, 'U')
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
                    produto_id, descricao, descricao_reduzida, codigo_interno,
                    secao_id, grupo_id, subgrupo_id, familia_id, marca_id,
                    estoque_minimo, estoque_maximo,
                    composicao, peso_variavel,
                    unidade_compra, itens_embalagem,
                    unidade_venda, itens_embalagem_venda,
                    unidade_transf, itens_embalagem_transf,
                    peso_bruto, peso_liquido,
                    fator_rendimento_unidade, fator_rendimento_custo,
                    tabela_a, genero_id, ncm, cest,
                    situacao_fiscal_id, situacao_fiscal_saida_id,
                    regime_estadual_id, impostos_federais_ids, natureza_imposto_id,
                    permite_desconto, desconto_maximo,
                    controla_estoque, envia_balanca, descricao_variavel,
                    preco_variavel, ativo_ecommerce, controla_validade, validade_dias,
                    finalidade, producao,
                    unidade_referencia, medida_referencial, indice_at,
                    fora_de_linha, data_saida, data_inclusao, data_alteracao,
                    status
                ) VALUES (
                    @produto_id, @descricao, @descricao_reduzida, @codigo_interno,
                    @secao_id, @grupo_id, @subgrupo_id, @familia_id, @marca_id,
                    @estoque_minimo, @estoque_maximo,
                    @composicao, @peso_variavel,
                    @unidade_compra, @itens_embalagem,
                    @unidade_venda, @itens_embalagem_venda,
                    @unidade_transf, @itens_embalagem_transf,
                    @peso_bruto, @peso_liquido,
                    @fator_rendimento_unidade, @fator_rendimento_custo,
                    @tabela_a, @genero_id, @ncm, @cest,
                    @situacao_fiscal_id, @situacao_fiscal_saida_id,
                    @regime_estadual_id, @impostos_federais_ids, @natureza_imposto_id,
                    @permite_desconto, @desconto_maximo,
                    @controla_estoque, @envia_balanca, @descricao_variavel,
                    @preco_variavel, @ativo_ecommerce, @controla_validade, @validade_dias,
                    @finalidade, @producao,
                    @unidade_referencia, @medida_referencial, @indice_at,
                    @fora_de_linha, @data_saida, @data_inclusao, @data_alteracao,
                    @status
                )
                ON CONFLICT(produto_id) DO UPDATE SET
                    descricao            = excluded.descricao,
                    descricao_reduzida   = excluded.descricao_reduzida,
                    codigo_interno       = excluded.codigo_interno,
                    secao_id             = excluded.secao_id,
                    grupo_id             = excluded.grupo_id,
                    subgrupo_id          = excluded.subgrupo_id,
                    familia_id           = excluded.familia_id,
                    marca_id             = excluded.marca_id,
                    estoque_minimo       = excluded.estoque_minimo,
                    estoque_maximo       = excluded.estoque_maximo,
                    composicao           = excluded.composicao,
                    peso_variavel        = excluded.peso_variavel,
                    tabela_a             = excluded.tabela_a,
                    ncm                  = excluded.ncm,
                    cest                 = excluded.cest,
                    fora_de_linha        = excluded.fora_de_linha,
                    data_alteracao       = excluded.data_alteracao,
                    updated_at           = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (prod) => {
                // Localizar estoque e regime da loja configurada
                const est = (prod.estoqueDoProduto || []).find(e => e.lojaId === lojaId) || {};
                const reg = (prod.regimesDoProduto  || []).find(r => r.lojaId === lojaId) || {};

                return [{
                    // Identificação
                    produto_id:               prod.id           ?? null,
                    descricao:                prod.descricao    ?? null,
                    descricao_reduzida:       prod.descricaoReduzida ?? null,
                    codigo_interno:           prod.codigoInterno ?? null,

                    // Hierarquia mercadológica
                    secao_id:                 prod.secaoId      ?? null,
                    grupo_id:                 prod.grupoId      ?? null,
                    subgrupo_id:              prod.subgrupoId   ?? null,
                    familia_id:               prod.familiaId    ?? null,
                    marca_id:                 prod.marcaId      ?? null,

                    // Estoque (por loja)
                    estoque_minimo:           est.estoqueMinimo ?? null,
                    estoque_maximo:           est.estoqueMaximo ?? null,

                    // Composição e peso
                    composicao:               prod.composicao   ?? null,
                    peso_variavel:            prod.pesoVariavel ?? null,

                    // Embalagens
                    unidade_compra:           prod.unidadeDeCompra              ?? null,
                    itens_embalagem:          prod.itensEmbalagem               ?? null,
                    unidade_venda:            prod.unidadeDeVenda               ?? null,
                    itens_embalagem_venda:    prod.itensEmbalagemVenda          ?? null,
                    unidade_transf:           prod.unidadeDeTransferencia       ?? null,
                    itens_embalagem_transf:   prod.itensEmbalagemTransferencia  ?? null,

                    // Pesos e rendimentos
                    peso_bruto:               prod.pesoBruto              ?? 0,
                    peso_liquido:             prod.pesoLiquido            ?? 0,
                    fator_rendimento_unidade: prod.fatorRendimentoUnidade ?? 0,
                    fator_rendimento_custo:   prod.fatorRendimentoCusto   ?? 0,

                    // Fiscal
                    tabela_a:                 prod.tabelaA                ?? null,
                    genero_id:                prod.generoId               ?? null,
                    ncm:                      prod.nomeclaturaMercosulId  ?? null,  // ← mapeamento correto
                    cest:                     prod.cest                   ?? null,
                    situacao_fiscal_id:       prod.situacaoFiscalId       ?? null,
                    situacao_fiscal_saida_id: prod.situacaoFiscalSaidaId  ?? null,
                    regime_estadual_id:       reg.regimeEstadualId        ?? null,
                    impostos_federais_ids:    BaseRepository._ids(prod.itensImpostosFederais),
                    natureza_imposto_id:      prod.naturezaDeImpostoFederalId ?? null,

                    // Flags booleanas → INTEGER (0/1) conforme schema
                    permite_desconto:    BaseRepository._bool(prod.permiteDesconto),
                    desconto_maximo:     prod.descontoMaximo1    ?? 0,
                    controla_estoque:    BaseRepository._bool(prod.controlaEstoque),
                    envia_balanca:       BaseRepository._bool(prod.enviaBalanca),
                    descricao_variavel:  BaseRepository._bool(prod.descricaoVariavel),
                    preco_variavel:      BaseRepository._bool(prod.precoVariavel),
                    ativo_ecommerce:     BaseRepository._bool(prod.ativoNoEcommerce),
                    controla_validade:   BaseRepository._bool(prod.controlaValidade),
                    validade_dias:       prod.validade          ?? 0,  // ← nome correto no schema

                    // Produção
                    finalidade:          prod.finalidadeProduto  ?? null,  // ← nome correto
                    producao:            prod.producao           ?? null,
                    unidade_referencia:  prod.unidadeDeReferencia ?? null,
                    medida_referencial:  prod.medidaReferencial  ?? 0,
                    indice_at:           prod.indiceAT           ?? null,

                    // Linha e datas
                    fora_de_linha:   prod.foraDeLinha === 'S' ? 1 : 0,
                    data_saida:      BaseRepository._date(prod.dataSaida),
                    data_inclusao:   BaseRepository._date(prod.dataInclusao),
                    data_alteracao:  BaseRepository._date(prod.dataAlteracao),

                    status: 'U'
                }];
            }
        );
    }
}

module.exports = ProdutoRepository;