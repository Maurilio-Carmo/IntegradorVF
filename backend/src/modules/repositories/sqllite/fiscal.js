// backend/src/modules/sqlite-repository/repositories/fiscal.js

const BaseRepository = require('../base-repository');
const db = require('../../../config/database-sqlite').getConnection();

/**
 * FiscalRepository
 * Gerencia: regime tributário, situações fiscais, impostos federais,
 * tabelas tributárias (entrada e saída).
 */

class FiscalRepository extends BaseRepository {

    // ─── REGIME TRIBUTÁRIO ────────────────────────────────────────────────────

    static importarRegimeTributario(regimes) {
        return BaseRepository._executarTransacao(
            'regimes tributários',
            regimes,
            (db) => db.prepare(`
                INSERT INTO regime_tributario (
                    regime_id, descricao, classificacao,
                    loja, fornecedor, status
                ) VALUES (
                    @regime_id, @descricao, @classificacao,
                    @loja, @fornecedor, @status
                )
                ON CONFLICT(regime_id) DO UPDATE SET
                    descricao = excluded.descricao,
                    classificacao = excluded.classificacao,
                    loja = excluded.loja,
                    fornecedor = excluded.fornecedor,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (r) => [{
                regime_id:     r.id              ?? null,
                descricao:     r.descricao       ?? null,
                classificacao: r.classificacao   ?? null,
                loja:          BaseRepository._bool(r.loja),
                fornecedor:    BaseRepository._bool(r.fornecedor),
                status: 'U'
            }]
        );
    }

    // ─── SITUAÇÕES FISCAIS ────────────────────────────────────────────────────

    static importarSituacoesFiscais(situacoes) {
        return BaseRepository._executarTransacao(
            'situações fiscais',
            situacoes,
            (db) => db.prepare(`
                INSERT INTO situacoes_fiscais (
                    situacao_id, descricao, descricao_completa,
                    substituto, status
                ) VALUES (
                    @situacao_id, @descricao, @descricao_completa,
                    @substituto, @status
                )
                ON CONFLICT(situacao_id) DO UPDATE SET
                    descricao          = excluded.descricao,
                    descricao_completa = excluded.descricao_completa,
                    substituto         = excluded.substituto,
                    updated_at         = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (s) => [{
                situacao_id:        s.id                  ?? null,
                descricao:          s.descricao           ?? null,
                descricao_completa: s.descricaoCompleta   ?? null,
                substituto:         BaseRepository._bool(s.substituto),
                status: 'U'
            }]
        );
    }

    // ─── TIPOS DE OPERAÇÕES ───────────────────────────────────────────────────

    static importarTiposOperacoes(tipos) {
        return BaseRepository._executarTransacao(
            'tipos de operações',
            tipos,
            (db) => db.prepare(`
                INSERT INTO tipos_operacoes (
                    operacao_id, descricao, tipo_de_operacao, tipo_geracao_financeiro,
                    modalidade, tipo_documento, origem_da_nota,
                    atualiza_custos, atualiza_estoque, incide_impostos_federais,
                    ipi_compoe_base_pis_cofins, outras_desp_base_pis_cofins,
                    outras_desp_base_icms, gera_fiscal, destaca_ipi, destaca_icms,
                    compoe_abc, imprime_descricao_nfe, envia_observacao_nfe,
                    utiliza_conferencia, cfop_no_estado, cfop_fora_do_estado,
                    cfop_exterior, observacao, codigo_cst, cfops_relacionados, status
                ) VALUES (
                    @operacao_id, @descricao, @tipo_de_operacao, @tipo_geracao_financeiro,
                    @modalidade, @tipo_documento, @origem_da_nota,
                    @atualiza_custos, @atualiza_estoque, @incide_impostos_federais,
                    @ipi_compoe_base_pis_cofins, @outras_desp_base_pis_cofins,
                    @outras_desp_base_icms, @gera_fiscal, @destaca_ipi, @destaca_icms,
                    @compoe_abc, @imprime_descricao_nfe, @envia_observacao_nfe,
                    @utiliza_conferencia, @cfop_no_estado, @cfop_fora_do_estado,
                    @cfop_exterior, @observacao, @codigo_cst, @cfops_relacionados, @status
                )
                ON CONFLICT(operacao_id) DO UPDATE SET
                    descricao  = excluded.descricao,
                    tipo_de_operacao = excluded.tipo_de_operacao,
                    tipo_geracao_financeiro = excluded.tipo_geracao_financeiro,
                    modalidade = excluded.modalidade,
                    tipo_documento = excluded.tipo_documento,
                    origem_da_nota = excluded.origem_da_nota,
                    atualiza_custos = excluded.atualiza_custos,
                    atualiza_estoque = excluded.atualiza_estoque,
                    incide_impostos_federais = excluded.incide_impostos_federais,
                    ipi_compoe_base_pis_cofins = excluded.ipi_compoe_base_pis_cofins,
                    outras_desp_base_pis_cofins = excluded.outras_desp_base_pis_cofins,
                    outras_desp_base_icms = excluded.outras_desp_base_icms,
                    gera_fiscal = excluded.gera_fiscal,
                    destaca_ipi = excluded.destaca_ipi,
                    destaca_icms = excluded.destaca_icms,
                    compoe_abc = excluded.compoe_abc,
                    imprime_descricao_nfe = excluded.imprime_descricao_nfe,
                    envia_observacao_nfe = excluded.envia_observacao_nfe,
                    utiliza_conferencia = excluded.utiliza_conferencia,
                    cfop_no_estado = excluded.cfop_no_estado,
                    cfop_fora_do_estado = excluded.cfop_fora_do_estado,
                    cfop_exterior = excluded.cfop_exterior,
                    observacao = excluded.observacao,
                    codigo_cst = excluded.codigo_cst,
                    cfops_relacionados = excluded.cfops_relacionados,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (t) => [{
                operacao_id:                t.id                            ?? null,
                descricao:                  t.descricao                     ?? null,
                tipo_de_operacao:           t.tipoDeOperacao                ?? null,
                tipo_geracao_financeiro:    t.tipoGeracaoFinanceiro         ?? null,
                modalidade:                 t.modalidade                    ?? null,
                tipo_documento:             t.tipoDocumento                 ?? null,
                origem_da_nota:             t.origemDaNota                  ?? null,
                atualiza_custos:            BaseRepository._bool(t.atualizaCustos),
                atualiza_estoque:           BaseRepository._bool(t.atualizaEstoque),
                incide_impostos_federais:   BaseRepository._bool(t.incideImpostosFederais),
                ipi_compoe_base_pis_cofins: BaseRepository._bool(t.ipiCompoeBasePisCofins),
                outras_desp_base_pis_cofins:BaseRepository._bool(t.outrasDespBasePisCofins),
                outras_desp_base_icms:      BaseRepository._bool(t.outrasDespBaseIcms),
                gera_fiscal:                BaseRepository._bool(t.geraFiscal),
                destaca_ipi:                BaseRepository._bool(t.destacaIpi),
                destaca_icms:               BaseRepository._bool(t.destacaIcms),
                compoe_abc:                 BaseRepository._bool(t.compoeAbc),
                imprime_descricao_nfe:      BaseRepository._bool(t.imprimeDescricaoNfe),
                envia_observacao_nfe:       BaseRepository._bool(t.enviaObservacaoNfe),
                utiliza_conferencia:        BaseRepository._bool(t.utilizaConferencia),
                cfop_no_estado:             t.cfopNoEstado                  ?? null,
                cfop_fora_do_estado:        t.cfopForaDoEstado              ?? null,
                cfop_exterior:              t.cfopExterior                  ?? null,
                observacao:                 t.observacao                    ?? null,
                codigo_cst:                 t.codigoCst                     ?? null,
                cfops_relacionados:         BaseRepository._ids(t.cfopsRelacionados),
                status: 'U'
            }]
        );
    }

    // ─── IMPOSTOS FEDERAIS ────────────────────────────────────────────────────

    static importarImpostosFederais(impostos) {
        return BaseRepository._executarTransacao(
            'impostos federais',
            impostos,
            (db) => db.prepare(`
                INSERT INTO impostos_federais (
                    imposto_id, descricao, tipo_imposto,
                    cst_entrada_real, cst_saida_real,
                    aliquota_entrada_real, aliquota_saida_real,
                    cst_entrada_presumido, cst_saida_presumido,
                    aliquota_entrada_presumido, aliquota_saida_presumido,
                    cst_entrada_simples, cst_saida_simples, status
                ) VALUES (
                    @imposto_id, @descricao, @tipo_imposto,
                    @cst_entrada_real, @cst_saida_real,
                    @aliquota_entrada_real, @aliquota_saida_real,
                    @cst_entrada_presumido, @cst_saida_presumido,
                    @aliquota_entrada_presumido, @aliquota_saida_presumido,
                    @cst_entrada_simples, @cst_saida_simples, @status
                )
                ON CONFLICT(imposto_id) DO UPDATE SET
                    descricao = excluded.descricao,
                    tipo_imposto = excluded.tipo_imposto,
                    cst_entrada_real = excluded.cst_entrada_real,
                    cst_saida_real = excluded.cst_saida_real,
                    aliquota_entrada_real = excluded.aliquota_entrada_real,
                    aliquota_saida_real = excluded.aliquota_saida_real,
                    cst_entrada_presumido = excluded.cst_entrada_presumido,
                    cst_saida_presumido = excluded.cst_saida_presumido,
                    aliquota_entrada_presumido = excluded.aliquota_entrada_presumido,
                    aliquota_saida_presumido = excluded.aliquota_saida_presumido,
                    cst_entrada_simples = excluded.cst_entrada_simples,
                    cst_saida_simples = excluded.cst_saida_simples,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (i) => [{
                imposto_id:                  i.id                           ?? null,
                descricao:                   i.descricao                    ?? null,
                tipo_imposto:                i.tipoImposto                  ?? null,
                cst_entrada_real:            i.cstEntradaReal               ?? null,
                cst_saida_real:              i.cstSaidaReal                 ?? null,
                aliquota_entrada_real:       i.aliquotaEntradaReal          ?? 0,
                aliquota_saida_real:         i.aliquotaSaidaReal            ?? 0,
                cst_entrada_presumido:       i.cstEntradaPresumido          ?? null,
                cst_saida_presumido:         i.cstSaidaPresumido            ?? null,
                aliquota_entrada_presumido:  i.aliquotaEntradaPresumido     ?? 0,
                aliquota_saida_presumido:    i.aliquotaSaidaPresumido       ?? 0,
                cst_entrada_simples:         i.cstEntradaSimples            ?? null,
                cst_saida_simples:           i.cstSaidaSimples              ?? null,
                status: 'U'
            }]
        );
    }

    // ─── TABELAS TRIBUTÁRIAS ENTRADA ──────────────────────────────────────────
    static importarTabelasTributarias(tabelas) {
        return BaseRepository._executarTransacao(
            'tabelas tributárias',
            tabelas,
            (db) => db.prepare(`
                INSERT INTO tabelas_tributarias (
                    tabela_id, tipo_operacao,
                    regime_estadual_id, situacao_fiscal_id, figura_fiscal_id,
                    uf_origem, classificacao_pessoa, uf_destino,
                    tributado_nf, isento_nf, outros_nf,
                    aliquota, agregado, tributado_icms, carga_liquida, aliquota_interna,
                    fecop, fecop_st, soma_ipi_bc, soma_ipi_bs, st_destacado,
                    csosn, csosn_cupom_fiscal, csosn_doc_fiscal,
                    cst_id, tributacao, cfop_id, cfop_cupom_id,
                    icms_desonerado, icms_origem, icms_efetivo, reducao_origem,
                    status
                ) VALUES (
                    @tabela_id, @tipo_operacao,
                    @regime_estadual_id, @situacao_fiscal_id, @figura_fiscal_id,
                    @uf_origem, @classificacao_pessoa, @uf_destino,
                    @tributado_nf, @isento_nf, @outros_nf,
                    @aliquota, @agregado, @tributado_icms, @carga_liquida, @aliquota_interna,
                    @fecop, @fecop_st, @soma_ipi_bc, @soma_ipi_bs, @st_destacado,
                    @csosn, @csosn_cupom_fiscal, @csosn_doc_fiscal,
                    @cst_id, @tributacao, @cfop_id, @cfop_cupom_id,
                    @icms_desonerado, @icms_origem, @icms_efetivo, @reducao_origem,
                    @status
                )
                ON CONFLICT(tabela_id, tipo_operacao, classificacao_pessoa, uf_destino)
                DO UPDATE SET
                    regime_estadual_id      = excluded.regime_estadual_id,
                    situacao_fiscal_id      = excluded.situacao_fiscal_id,
                    figura_fiscal_id        = excluded.figura_fiscal_id,
                    tributado_nf            = excluded.tributado_nf,
                    isento_nf               = excluded.isento_nf,
                    outros_nf               = excluded.outros_nf,
                    aliquota                = excluded.aliquota,
                    agregado                = excluded.agregado,
                    tributado_icms          = excluded.tributado_icms,
                    carga_liquida           = excluded.carga_liquida,
                    aliquota_interna        = excluded.aliquota_interna,
                    fecop                   = excluded.fecop,
                    fecop_st                = excluded.fecop_st,
                    soma_ipi_bc             = excluded.soma_ipi_bc,
                    soma_ipi_bs             = excluded.soma_ipi_bs,
                    st_destacado            = excluded.st_destacado,
                    csosn                   = excluded.csosn,
                    csosn_cupom_fiscal      = excluded.csosn_cupom_fiscal,
                    csosn_doc_fiscal        = excluded.csosn_doc_fiscal,
                    cst_id                  = excluded.cst_id,
                    tributacao              = excluded.tributacao,
                    cfop_id                 = excluded.cfop_id,
                    cfop_cupom_id           = excluded.cfop_cupom_id,
                    icms_desonerado         = excluded.icms_desonerado,
                    icms_origem             = excluded.icms_origem,
                    icms_efetivo            = excluded.icms_efetivo,
                    reducao_origem          = excluded.reducao_origem,
                    updated_at              = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (t) => [FiscalRepository._mapTabela(t)]
        );
    }

    static _mapTabela(t) {
        return {
            tabela_id:               t.tabelaId              ?? t.id   ?? null,
            tipo_operacao:           t.tipoDeOperacao,
            regime_estadual_id:      t.regimeEstadualId                ?? null,
            situacao_fiscal_id:      t.situacaoFiscalId                ?? null,
            figura_fiscal_id:        t.figuraFiscalId                  ?? null,
            uf_origem:               t.ufOrigem                        ?? null,
            classificacao_pessoa:    t.classificacaoPessoa             ?? null,
            uf_destino:              t.ufDestino                       ?? null,
            tributado_nf:            t.tributadoNf                     ?? 0,
            isento_nf:               t.isentoNf                        ?? 0,
            outros_nf:               t.outrosNf                        ?? 0,
            aliquota:                t.aliquota                        ?? 0,
            agregado:                t.agregado                        ?? 0,
            tributado_icms:          t.tributadoIcms                   ?? 0,
            carga_liquida:           t.cargaLiquida                    ?? 0,
            aliquota_interna:        t.aliquotaInterna                 ?? 0,
            fecop:                   t.fecop                           ?? 0,
            fecop_st:                t.fecopSt                         ?? 0,
            soma_ipi_bc:             BaseRepository._bool(t.somaIpiBc),
            soma_ipi_bs:             BaseRepository._bool(t.somaIpiBs),
            st_destacado:            BaseRepository._bool(t.stDestacado),
            csosn:                   t.csosn                           ?? null,
            csosn_cupom_fiscal:      t.csosnCupomFiscal                ?? null,
            csosn_doc_fiscal:        t.csosnDocumentoFiscal            ?? null,
            cst_id:                  t.cstId                           ?? null,
            tributacao:              t.tributacao                       ?? null,
            cfop_id:                 t.cfopId                          ?? null,
            cfop_cupom_id:           t.cfopCuponsFiscaisId             ?? null,
            icms_desonerado:         BaseRepository._bool(t.icmsDesonerado),
            icms_origem:             t.icmsOrigem                      ?? 0,
            icms_efetivo:            BaseRepository._bool(t.icmsEfetivo),
            reducao_origem:          t.reducaoOrigem                   ?? 0,
            status:                  'U',
        };
    }

    // ─── CENÁRIOS FISCAIS NCM ────────────────────────────────────────────────
    static importarCenariosFiscais(cenarios) {
        if (!cenarios || cenarios.length === 0) {
            return { success: true, count: 0 };
        }

        try {
            const db = require('../../../config/database-sqlite').getConnection();

            // ── Prepared statements ──────────────────────────────────────────
            const stmtCenario = db.prepare(`
                INSERT INTO cenarios_fiscais (
                    cenario_id, descricao, cst, c_class_trib, status
                ) VALUES (
                    @cenario_id, @descricao, @cst, @c_class_trib, @status
                )
                ON CONFLICT(cenario_id) DO UPDATE SET
                    descricao    = excluded.descricao,
                    cst          = excluded.cst,
                    c_class_trib = excluded.c_class_trib,
                    updated_at   = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `);

            const stmtNcm = db.prepare(`
                INSERT INTO cenarios_fiscais_ncms (
                    codigo_ncm, descricao_ncm, codigo_cenario_fiscal
                ) VALUES (
                    @codigo_ncm, @descricao_ncm, @codigo_cenario_fiscal
                )
                ON CONFLICT(codigo_cenario_fiscal, codigo_ncm) DO UPDATE SET
                    descricao_ncm = excluded.descricao_ncm
            `);

            const stmtLoja = db.prepare(`
                INSERT INTO cenarios_fiscais_lojas (
                    codigo_loja, descricao_loja, uf_origem, codigo_cenario_fiscal
                ) VALUES (
                    @codigo_loja, @descricao_loja, @uf_origem, @codigo_cenario_fiscal
                )
                ON CONFLICT(codigo_cenario_fiscal, codigo_loja) DO UPDATE SET
                    descricao_loja = excluded.descricao_loja,
                    uf_origem      = excluded.uf_origem
            `);

            const stmtUf = db.prepare(`
                INSERT INTO cenarios_fiscais_ufs_destino (
                    uf_destino, codigo_cenario_fiscal
                ) VALUES (
                    @uf_destino, @codigo_cenario_fiscal
                )
                ON CONFLICT(codigo_cenario_fiscal, uf_destino) DO NOTHING
            `);

            // ── Execução em transação única ──────────────────────────────────
            const transacao = db.transaction((lista) => {
                for (const c of lista) {
                    const cenarioId = c.id ?? null;

                    // 1. Cenário principal
                    stmtCenario.run({
                        cenario_id:   cenarioId,
                        descricao:    c.descricao    ?? null,
                        cst:          c.cst          ?? null,
                        c_class_trib: c.cClassTrib   ?? null,
                        status:       'U',
                    });

                    // 2. NCMs
                    for (const n of (c.ncms || [])) {
                        stmtNcm.run({
                            codigo_ncm:            n.codigoNcm            ?? null,
                            descricao_ncm:         n.descricaoNcm         ?? null,
                            codigo_cenario_fiscal: n.codigoCenarioFiscal  ?? cenarioId,
                        });
                    }

                    // 3. Lojas
                    for (const l of (c.lojas || [])) {
                        stmtLoja.run({
                            codigo_loja:           l.codigoLoja           ?? null,
                            descricao_loja:        l.descricaoLoja        ?? null,
                            uf_origem:             l.ufOrigem             ?? null,
                            codigo_cenario_fiscal: l.codigoCenarioFiscal  ?? cenarioId,
                        });
                    }

                    // 4. UFs Destino
                    for (const u of (c.ufsDestino || [])) {
                        stmtUf.run({
                            uf_destino:            u.ufDestino            ?? null,
                            codigo_cenario_fiscal: u.codigoCenarioFiscal  ?? cenarioId,
                        });
                    }
                }
            });

            transacao(cenarios);

            console.log(`✅ [FiscalRepository] ${cenarios.length} cenários fiscais importados.`);
            return { success: true, count: cenarios.length };

        } catch (error) {
            console.error('❌ [FiscalRepository] importarCenariosFiscais:', error.message);
            return { success: false, error: error.message };
        }
    }

}

module.exports = FiscalRepository;