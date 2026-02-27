// backend/src/modules/sqlite-repository/repositories/produto.js

const BaseRepository = require('../base-repository');
const dbSQLite = require('../../../config/database-sqlite'); 

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

    // ─── PRODUTOS (+ tabelas relacionais) ────────────────────────────────────

    /**
     * Importa produtos e persiste TODAS as sub-entidades em uma única transação:
     *   produto_min_max          ← estoqueDoProduto[]
     *   produto_regimes          ← regimesDoProduto[]
     *   produto_componentes      ← componentes[]
     *   produto_impostos_federais← itensImpostosFederais[]
     *
     * @param {Array}  produtos - Lista de produtos vindos da API
     * @returns {{ success: boolean, count: number, counters: object }}
     */
    static importarProdutos(produtos) {

        if (!produtos || produtos.length === 0) {
            return { success: true, count: 0, counters: {} };
        }

        try {
            console.log(`📥 Importando ${produtos.length} produtos...`);
            dbSQLite.getConnection();

            // ── 1. Produto principal ─────────────────────────────────────────────
            // ATENÇÃO: colunas regime_estadual e impostos_federais foram REMOVIDAS
            //          do DDL — agora vivem em tabelas próprias abaixo.
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
                    situacao_fiscal, situacao_fiscal_saida, natureza_imposto,
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
                    @situacao_fiscal, @situacao_fiscal_saida, @natureza_imposto,
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
                    data_saida             = excluded.data_saida,
                    data_inclusao          = excluded.data_inclusao,
                    data_alteracao         = excluded.data_alteracao,
                    updated_at             = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `);

            // ── 2. Estoque mínimo/máximo por loja ───────────────────────────────
            // Tabela: produto_min_max  (PK composta: produto_id + loja_id)
            const stmtMinMax = dbSQLite.db.prepare(`
                INSERT INTO produto_min_max (
                    produto_id, loja_id, estoque_minimo, estoque_maximo, status
                ) VALUES (
                    @produto_id, @loja_id, @estoque_minimo, @estoque_maximo, 'U'
                )
                ON CONFLICT(produto_id, loja_id) DO UPDATE SET
                    estoque_minimo = excluded.estoque_minimo,
                    estoque_maximo = excluded.estoque_maximo,
                    updated_at     = CURRENT_TIMESTAMP
            `);

            // ── 3. Regime tributário por loja ────────────────────────────────────
            // Tabela: produto_regimes  (PK composta: produto_id + loja_id)
            // Substitui a antiga coluna regime_estadual na tabela produtos.
            const stmtRegime = dbSQLite.db.prepare(`
                INSERT INTO produto_regimes (
                    produto_id, loja_id, regime_estadual_id, status
                ) VALUES (
                    @produto_id, @loja_id, @regime_estadual_id, 'U'
                )
                ON CONFLICT(produto_id, loja_id) DO UPDATE SET
                    regime_estadual_id = excluded.regime_estadual_id,
                    updated_at         = CURRENT_TIMESTAMP
            `);

            // ── 4. Componentes (composição/kit/rendimento) ───────────────────────
            // Tabela: produto_componentes  (PK: id vindo da API)
            const stmtComponente = dbSQLite.db.prepare(`
                INSERT INTO produto_componentes (
                    id, produto_id, componente_produto_id,
                    quantidade, preco1, preco2, preco3, status
                ) VALUES (
                    @id, @produto_id, @componente_produto_id,
                    @quantidade, @preco1, @preco2, @preco3, 'U'
                )
                ON CONFLICT(id) DO UPDATE SET
                    componente_produto_id = excluded.componente_produto_id,
                    quantidade            = excluded.quantidade,
                    preco1                = excluded.preco1,
                    preco2                = excluded.preco2,
                    preco3                = excluded.preco3,
                    updated_at            = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `);

            // ── 5. Impostos federais do produto (relação N:N) ────────────────────
            // Tabela: produto_impostos_federais  (PK composta: produto_id + imposto_id)
            // Substitui a antiga coluna impostos_federais TEXT serializada.
            const stmtImposto = dbSQLite.db.prepare(`
                INSERT OR IGNORE INTO produto_impostos_federais (
                    produto_id, imposto_id, status
                ) VALUES (
                    @produto_id, @imposto_id, 'U'
                )
            `);

            // ── 6. Contadores para relatório ─────────────────────────────────────
            const counters = {
                minMax:     0,
                regimes:    0,
                componentes:0,
                impostos:   0,
            };

            // ── 7. Transação única — atomicidade total ───────────────────────────
            const transaction = dbSQLite.db.transaction(() => {
                for (const p of produtos) {

                    // 7a. Produto principal
                    stmtProduto.run({
                        produto_id:            p.id                                   ?? null,
                        descricao:             p.descricao                            ?? null,
                        descricao_reduzida:    p.descricaoReduzida                    ?? null,
                        secao_id:              p.secaoId                              ?? null,
                        grupo_id:              p.grupoId                              ?? null,
                        subgrupo_id:           p.subgrupoId                           ?? null,
                        familia_id:            p.familiaId                            ?? null,
                        marca_id:              p.marcaId                              ?? null,
                        composicao:            p.composicao                           ?? null,
                        peso_variavel:         p.pesoVariavel                         ?? null,
                        unidade_compra:        p.unidadeDeCompra                      ?? null,
                        itens_embalagem:       p.itensEmbalagem                       ?? 1,
                        unidade_venda:         p.unidadeDeVenda                       ?? null,
                        itens_embalagem_venda: p.itensEmbalagemVenda                  ?? 1,
                        unidade_transf:        p.unidadeDeTransferencia               ?? null,
                        itens_embalagem_transf:p.itensEmbalagemTransferencia          ?? 1,
                        peso_bruto:            p.pesoBruto                            ?? 0,
                        peso_liquido:          p.pesoLiquido                          ?? 0,
                        rendimento_unidade:    p.fatorRendimentoUnidade               ?? 0,
                        rendimento_custo:      p.fatorRendimentoCusto                 ?? 0,
                        tabela_a:              p.tabelaA                              ?? null,
                        genero:                BaseRepository._str(p.generoId)        ?? null,
                        ncm:                   p.nomeclaturaMercosulId                ?? null,
                        cest:                  BaseRepository._str(p.cest)            ?? null,
                        situacao_fiscal:       p.situacaoFiscalId                     ?? null,
                        situacao_fiscal_saida: p.situacaoFiscalSaidaId                ?? null,
                        natureza_imposto:      p.naturezaDeImpostoFederalId           ?? null,
                        permite_desconto:      BaseRepository._bool(p.permiteDesconto),
                        desconto_maximo:       p.descontoMaximo1                      ?? 0,
                        controla_estoque:      BaseRepository._bool(p.controlaEstoque),
                        envia_balanca:         BaseRepository._bool(p.enviaBalanca),
                        descricao_variavel:    BaseRepository._bool(p.descricaoVariavel),
                        preco_variavel:        BaseRepository._bool(p.precoVariavel),
                        ativo_ecommerce:       BaseRepository._bool(p.ativoNoEcommerce),
                        controla_validade:     BaseRepository._bool(p.controlaValidade),
                        validade_dias:         p.validade                             ?? 0,
                        finalidade:            p.finalidadeProduto                    ?? null,
                        producao:              p.producao                             ?? null,
                        unidade_referencia:    p.unidadeDeReferencia                  ?? null,
                        medida_referencial:    p.medidaReferencial                    ?? 1,
                        indice_at:             p.indiceAT                             ?? null,
                        fora_linha:            p.foraDeLinha === 'S' ? 1 : 0,
                        data_saida:            BaseRepository._date(p.dataSaida),
                        data_inclusao:         BaseRepository._date(p.dataInclusao),
                        data_alteracao:        BaseRepository._date(p.dataAlteracao),
                        status:                'U',
                    });

                    // 7b. Estoque mínimo/máximo — TODAS as lojas do produto
                    for (const est of (p.estoqueDoProduto || [])) {
                        stmtMinMax.run({
                            produto_id:     p.id,
                            loja_id:        est.lojaId        ?? null,
                            estoque_minimo: est.estoqueMinimo ?? null,
                            estoque_maximo: est.estoqueMaximo ?? null,
                        });
                        counters.minMax++;
                    }

                    // 7c. Regimes tributários — TODAS as lojas do produto
                    for (const reg of (p.regimesDoProduto || [])) {
                        stmtRegime.run({
                            produto_id:         p.id,
                            loja_id:            reg.lojaId           ?? null,
                            regime_estadual_id: reg.regimeEstadualId ?? null,
                        });
                        counters.regimes++;
                    }

                    // 7d. Componentes (kit / composto / rendimento)
                    for (const comp of (p.componentes || [])) {
                        stmtComponente.run({
                            id:                    comp.id        ?? null,
                            produto_id:            p.id,
                            componente_produto_id: comp.produtoId ?? null,
                            quantidade:            comp.quantidade ?? 1,
                            preco1:                comp.preco1    ?? 0,
                            preco2:                comp.preco2    ?? 0,
                            preco3:                comp.preco3    ?? 0,
                        });
                        counters.componentes++;
                    }

                    // 7e. Impostos federais vinculados ao produto
                    for (const imp of (p.itensImpostosFederais || [])) {
                        if (imp.id != null) {
                            stmtImposto.run({
                                produto_id: p.id,
                                imposto_id: String(imp.id),
                            });
                            counters.impostos++;
                        }
                    }
                }
            });

            // ── 8. Executar transação ────────────────────────────────────────────
            transaction();

            console.log(
                `✅ ${produtos.length} produtos | ` +
                `${counters.minMax} estoques | ` +
                `${counters.regimes} regimes | ` +
                `${counters.componentes} componentes | ` +
                `${counters.impostos} impostos`
            );

            return { success: true, count: produtos.length, counters };

        } catch (error) {
            console.error('❌ Erro ao importar produtos:', error.message);
            throw error;
        }
    }

    // ─── PRODUTO AUXILIARES ───────────────────────────────────────────────────────
    
    static importarProdutoAuxiliares(produtoAuxiliares) {
        return BaseRepository._executarTransacao(
            'produto auxiliares',
            produtoAuxiliares,
            (db) => db.prepare(`
                INSERT INTO produto_auxiliares (
                    codigo_id, produto_id, fator, ean_tributado, tipo, status
                ) VALUES (
                    @codigo_id, @produto_id, @fator, @ean_tributado, @tipo, @status
                )
                ON CONFLICT(codigo_id) DO UPDATE SET
                    produto_id      = excluded.produto_id,
                    fator           = excluded.fator,
                    ean_tributado   = excluded.ean_tributado,
                    tipo            = excluded.tipo,
                    status          = excluded.status,
                    updated_at      = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (c) => [{
                codigo_id:      c.id,
                produto_id:     c.produtoId,
                fator:          c.fator                                 ?? 1,
                ean_tributado:  BaseRepository._bool(c.eanTributado),
                tipo:           c.tipo                                  ?? null,
                status:         'U',
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