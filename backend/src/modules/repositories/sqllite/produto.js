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
     * Importa produtos e salva estoque por loja em tabela separada.
     * @param {Array}  produtos - Lista de produtos vindos da API
     * @param {number} lojaId   - ID da loja (usado só para filtrar regime tributário)
     */
    static importarProdutos(produtos, lojaId) {

        if (!produtos || produtos.length === 0) {
            return { success: true, count: 0, countEstoque: 0 };
        }

        try {
            console.log(`📥 Importando ${produtos.length} produtos...`);
            dbSQLite.getConnection();

            // ── 1. Statement para a tabela principal de produtos ─────────────────
            const stmtProduto = dbSQLite.db.prepare(`
                INSERT INTO produtos (
                    produto_id, descricao, descricao_reduzida,
                    secao_id, grupo_id, subgrupo_id, familia_id, marca_id,
                    composicao, peso_variavel,
                    unidade_compra, itens_embalagem,
                    unidade_venda, itens_embalagem_venda,
                    unidade_transf, itens_embalagem_transf,
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
                    @composicao, @peso_variavel,
                    @unidade_compra, @itens_embalagem,
                    @unidade_venda, @itens_embalagem_venda,
                    @unidade_transf, @itens_embalagem_transf,
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
                    descricao              = excluded.descricao,
                    descricao_reduzida     = excluded.descricao_reduzida,
                    secao_id               = excluded.secao_id,
                    grupo_id               = excluded.grupo_id,
                    subgrupo_id            = excluded.subgrupo_id,
                    familia_id             = excluded.familia_id,
                    marca_id               = excluded.marca_id,
                    composicao             = excluded.composicao,
                    peso_variavel          = excluded.peso_variavel,
                    unidade_compra         = excluded.unidade_compra,
                    itens_embalagem        = excluded.itens_embalagem,
                    unidade_venda          = excluded.unidade_venda,
                    itens_embalagem_venda  = excluded.itens_embalagem_venda,
                    unidade_transf         = excluded.unidade_transf,
                    itens_embalagem_transf = excluded.itens_embalagem_transf,
                    peso_bruto             = excluded.peso_bruto,
                    peso_liquido           = excluded.peso_liquido,
                    rendimento_unidade     = excluded.rendimento_unidade,
                    rendimento_custo       = excluded.rendimento_custo,
                    tabela_a               = excluded.tabela_a,
                    genero                 = excluded.genero,
                    ncm                    = excluded.ncm,
                    cest                   = excluded.cest,
                    situacao_fiscal        = excluded.situacao_fiscal,
                    situacao_fiscal_saida  = excluded.situacao_fiscal_saida,
                    regime_estadual        = excluded.regime_estadual,
                    impostos_federais      = excluded.impostos_federais,
                    natureza_imposto       = excluded.natureza_imposto,
                    permite_desconto       = excluded.permite_desconto,
                    desconto_maximo        = excluded.desconto_maximo,
                    controla_estoque       = excluded.controla_estoque,
                    envia_balanca          = excluded.envia_balanca,
                    descricao_variavel     = excluded.descricao_variavel,
                    preco_variavel         = excluded.preco_variavel,
                    ativo_ecommerce        = excluded.ativo_ecommerce,
                    controla_validade      = excluded.controla_validade,
                    validade_dias          = excluded.validade_dias,
                    finalidade             = excluded.finalidade,
                    producao               = excluded.producao,
                    unidade_referencia     = excluded.unidade_referencia,
                    medida_referencial     = excluded.medida_referencial,
                    indice_at              = excluded.indice_at,
                    fora_linha             = excluded.fora_linha,
                    data_alteracao         = excluded.data_alteracao,
                    updated_at             = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `);

            // ── 2. Statement para gravar estoque mínimo/máximo por loja ──────────
            const stmtEstoque = dbSQLite.db.prepare(`
                INSERT INTO estoque_min_max (
                    produto_id, loja_id, estoque_minimo, estoque_maximo, status
                ) VALUES (
                    @produto_id, @loja_id, @estoque_minimo, @estoque_maximo, @status
                )
                ON CONFLICT(produto_id, loja_id) DO UPDATE SET
                    estoque_minimo = excluded.estoque_minimo,
                    estoque_maximo = excluded.estoque_maximo,
                    status         = excluded.status,
                    updated_at     = CURRENT_TIMESTAMP
            `);

            let countEstoque = 0;

            // ── 3. Transação única: garante que produto e estoques salvam juntos ─
            const transaction = dbSQLite.db.transaction(() => {
                for (const p of produtos) {
                    const reg = (p.regimesDoProduto || []).find(r => r.lojaId === lojaId) || {};

                    stmtProduto.run({
                        produto_id:            p.id                                  ?? null,
                        descricao:             p.descricao                           ?? null,
                        descricao_reduzida:    p.descricaoReduzida                   ?? null,
                        secao_id:              p.secaoId                             ?? null,
                        grupo_id:              p.grupoId                             ?? null,
                        subgrupo_id:           p.subgrupoId                          ?? null,
                        familia_id:            p.familiaId                           ?? null,
                        marca_id:              p.marcaId                             ?? null,
                        composicao:            p.composicao                          ?? null,
                        peso_variavel:         p.pesoVariavel                        ?? null,
                        unidade_compra:        p.unidadeDeCompra                     ?? null,
                        itens_embalagem:       p.itensEmbalagem                      ?? 1,
                        unidade_venda:         p.unidadeDeVenda                      ?? null,
                        itens_embalagem_venda: p.itensEmbalagemVenda                 ?? 1,
                        unidade_transf:        p.unidadeDeTransferencia              ?? null,
                        itens_embalagem_transf:p.itensEmbalagemTransferencia         ?? 1,
                        peso_bruto:            p.pesoBruto                           ?? 0,
                        peso_liquido:          p.pesoLiquido                         ?? 0,
                        rendimento_unidade:    p.fatorRendimentoUnidade              ?? 0,
                        rendimento_custo:      p.fatorRendimentoCusto                ?? 0,
                        tabela_a:              p.tabelaA                             ?? null,
                        genero:                BaseRepository._str(p.generoId)       ?? null,
                        ncm:                   p.nomeclaturaMercosulId               ?? null,
                        cest:                  BaseRepository._str(p.cest)           ?? null,
                        situacao_fiscal:       p.situacaoFiscalId                    ?? null,
                        situacao_fiscal_saida: p.situacaoFiscalSaidaId               ?? null,
                        regime_estadual:       reg.regimeEstadualId                  ?? null,
                        impostos_federais:     BaseRepository._ids(p.itensImpostosFederais),
                        natureza_imposto:      p.naturezaDeImpostoFederalId          ?? null,
                        permite_desconto:      BaseRepository._bool(p.permiteDesconto),
                        desconto_maximo:       p.descontoMaximo1                     ?? 0,
                        controla_estoque:      BaseRepository._bool(p.controlaEstoque),
                        envia_balanca:         BaseRepository._bool(p.enviaBalanca),
                        descricao_variavel:    BaseRepository._bool(p.descricaoVariavel),
                        preco_variavel:        BaseRepository._bool(p.precoVariavel),
                        ativo_ecommerce:       BaseRepository._bool(p.ativoNoEcommerce),
                        controla_validade:     BaseRepository._bool(p.controlaValidade),
                        validade_dias:         p.validade                            ?? 0,
                        finalidade:            p.finalidadeProduto                   ?? null,
                        producao:              p.producao                            ?? null,
                        unidade_referencia:    p.unidadeDeReferencia                 ?? null,
                        medida_referencial:    p.medidaReferencial                   ?? 1,
                        indice_at:             p.indiceAT                            ?? null,
                        fora_linha:            p.foraDeLinha === 'S' ? 1 : 0,
                        data_saida:            BaseRepository._date(p.dataSaida),
                        data_inclusao:         BaseRepository._date(p.dataInclusao),
                        data_alteracao:        BaseRepository._date(p.dataAlteracao),
                        status:                'U',
                    });

                    // 3b. Salvar estoque de TODAS as lojas do produto
                    for (const est of (p.estoqueDoProduto || [])) {
                        stmtEstoque.run({
                            produto_id:     p.id,
                            loja_id:        est.lojaId        ?? null,
                            estoque_minimo: est.estoqueMinimo ?? null,
                            estoque_maximo: est.estoqueMaximo ?? null,
                            status:          'U',
                        });
                        countEstoque++;
                    }
                }
            });

            // ── 4. Executar tudo de uma vez ───────────────────────────────────────
            transaction();

            console.log(`✅ ${produtos.length} produtos | ${countEstoque} registros de estoque salvos`);
            return { success: true, count: produtos.length, countEstoque };

        } catch (error) {
            console.error('❌ Erro ao importar produtos:', error.message);
            throw error;
        }
    }

    // ─── CÓDIGOS AUXILIARES ───────────────────────────────────────────────────────
    
    static importarCodigosAuxiliares(codigosAuxiliares) {
        return BaseRepository._executarTransacao(
            'códigos auxiliares',
            codigosAuxiliares,
            (db) => db.prepare(`
                INSERT INTO codigos_auxiliares (
                    codigo_id, produto_id, fator, ean_tributado, tipo, status
                ) VALUES (
                    @codigo_id, @produto_id, @fator, @ean_tributado, @tipo, 'U'
                )
                ON CONFLICT(codigo_id) DO UPDATE SET
                    produto_id      = excluded.produto_id,
                    fator           = excluded.fator,
                    ean_tributado   = excluded.ean_tributado,
                    tipo            = excluded.tipo,
                    updated_at      = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (c) => [{
                codigo_id:      c.id                                    ?? null,
                produto_id:     c.produtoId                             ?? null,
                fator:          c.fator                                 ?? 1,
                ean_tributado:  BaseRepository._bool(c.eanTributado),
                tipo:           c.tipo                                  ?? null,
            }]
        );
    }

    // ─── PRODUTO FORNECEDORES ───────────────────────────────────────────────────────────

    static importarProdutoFornecedores(produtoFornecedores) {
        return BaseRepository._executarTransacao(
            'fornecedores do produto',
            produtoFornecedores,
            (db) => db.prepare(`
                INSERT INTO produto_fornecedores (
                    id, produto_id, fornecedor_id,
                    referencia, unidade, fator, nivel, status
                ) VALUES (
                    @id, @produto_id, @fornecedor_id,
                    @referencia, @unidade, @fator, @nivel, 'U'
                )
                ON CONFLICT(id) DO UPDATE SET
                    produto_id    = excluded.produto_id,
                    fornecedor_id = excluded.fornecedor_id,
                    referencia    = excluded.referencia,
                    unidade       = excluded.unidade,
                    fator         = excluded.fator,
                    nivel         = excluded.nivel,
                    updated_at    = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (f) => [{
                id:            f.id            ?? null,
                produto_id:    f.produtoId     ?? null,
                fornecedor_id: f.fornecedorId  ?? null,
                referencia:    f.referencia    ?? null,
                unidade:       f.unidade       ?? null,
                fator:         f.quantidade    ?? 1,
                nivel:         f.nivel         ?? null,
            }]
        );
    }
}

module.exports = ProdutoRepository;