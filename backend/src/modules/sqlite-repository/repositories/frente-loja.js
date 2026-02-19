// backend/src/modules/sqlite-repository/repositories/frente-loja.js

const BaseRepository = require('../base-repository');

/**
 * FrenteLojaRepository
 * Gerencia: caixas, pagamentos PDV, recebimentos PDV,
 * motivos (desconto/cancelamento/devolução).
 */

class FrenteLojaRepository extends BaseRepository {

    // ─── CAIXAS ───────────────────────────────────────────────────────────────

    static importarCaixas(caixas) {
        return BaseRepository._executarTransacao(
            'caixas',
            caixas,
            (db) => db.prepare(`
                INSERT INTO caixas (
                    caixa_id, loja_id, numero, serie_do_equipamento,
                    versao, data_ultima_venda, hora,
                    visivel_monitoramento, tipo_frente_loja, status
                ) VALUES (
                    @caixa_id, @loja_id, @numero, @serie_do_equipamento,
                    @versao, @data_ultima_venda, @hora,
                    @visivel_monitoramento, @tipo_frente_loja, @status
                )
                ON CONFLICT(caixa_id) DO UPDATE SET
                    loja_id         = excluded.loja_id,
                    numero          = excluded.numero,
                    serie_do_equipamento = excluded.serie_do_equipamento,
                    versao          = excluded.versao,
                    data_ultima_venda = excluded.data_ultima_venda,
                    hora            = excluded.hora,
                    visivel_monitoramento = excluded.visivel_monitoramento,
                    tipo_frente_loja = excluded.tipo_frente_loja,
                    updated_at      = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (c) => [{
                caixa_id:             c.id                    ?? null,
                loja_id:              c.lojaId                ?? null,
                numero:               c.numero                ?? null,
                serie_do_equipamento: c.serieDoEquipamento    ?? null,
                versao:               c.versao                ?? null,
                data_ultima_venda:    c.dataUltimaVenda       ?? null,
                hora:                 c.hora                  ?? null,
                visivel_monitoramento:BaseRepository._bool(c.visivelMonitoramento !== false),
                tipo_frente_loja:     c.tipoDeFrenteLoja      ?? null,
                status: 'U'
            }]
        );
    }

    // ─── FORMAS DE PAGAMENTO ──────────────────────────────────────────────────


    // ─── PAGAMENTOS PDV ───────────────────────────────────────────────────────

    static importarPagamentosPDV(pagamentos) {
        return BaseRepository._executarTransacao(
            'pagamentos PDV',
            pagamentos,
            (db) => db.prepare(`
                INSERT INTO pagamentos_pdv (
                    pagamento_id, descricao, categoria_id,
                    loja_id, valor_maximo, status
                ) VALUES (
                    @pagamento_id, @descricao, @categoria_id,
                    @loja_id, @valor_maximo, @status
                )
                ON CONFLICT(pagamento_id) DO UPDATE SET
                    descricao  = excluded.descricao,
                    categoria_id = excluded.categoria_id,
                    loja_id = excluded.loja_id,
                    valor_maximo = excluded.valor_maximo,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (p) => [{
                pagamento_id: p.id           ?? null,
                descricao:    p.descricao    ?? null,
                categoria_id: p.categoriaId  ?? null,
                loja_id:      p.lojaId       ?? null,
                valor_maximo: p.valorMaximo  ?? null,
                status: 'U'
            }]
        );
    }

    // ─── RECEBIMENTOS PDV ─────────────────────────────────────────────────────

    static importarRecebimentosPDV(recebimentos) {
        return BaseRepository._executarTransacao(
            'recebimentos PDV',
            recebimentos,
            (db) => db.prepare(`
                INSERT INTO recebimentos_pdv (
                    recebimento_id, descricao, categoria_id,
                    loja_id, tipo_recebimento, qtd_autenticacoes,
                    imprime_doc, qtd_impressoes, valor_recebimento, status
                ) VALUES (
                    @recebimento_id, @descricao, @categoria_id,
                    @loja_id, @tipo_recebimento, @qtd_autenticacoes,
                    @imprime_doc, @qtd_impressoes, @valor_recebimento, @status
                )
                ON CONFLICT(recebimento_id) DO UPDATE SET
                    descricao  = excluded.descricao,
                    categoria_id = excluded.categoria_id,
                    loja_id = excluded.loja_id,
                    tipo_recebimento = excluded.tipo_recebimento,
                    qtd_autenticacoes = excluded.qtd_autenticacoes,
                    imprime_doc = excluded.imprime_doc,
                    qtd_impressoes = excluded.qtd_impressoes,
                    valor_recebimento = excluded.valor_recebimento,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (r) => [{
                recebimento_id:     r.id                    ?? null,
                descricao:          r.descricao             ?? null,
                categoria_id:       r.categoriaId           ?? null,
                loja_id:            r.lojaId                ?? null,
                tipo_recebimento:   r.tipoRecebimento       ?? null,
                qtd_autenticacoes:  r.qtdAutenticacoes      ?? 0,
                imprime_doc:        BaseRepository._bool(r.imprimeDoc),
                qtd_impressoes:     r.qtdImpressoes         ?? 0,
                valor_recebimento:  r.valorRecebimento      ?? 0,
                status: 'U'
            }]
        );
    }

    // ─── MOTIVOS DESCONTO ─────────────────────────────────────────────────────

    static importarMotivosDesconto(motivos) {
        return BaseRepository._executarTransacao(
            'motivos de desconto',
            motivos,
            (db) => db.prepare(`
                INSERT INTO motivos_desconto (
                    motivo_id, descricao, tipo_aplicacao_desconto,
                    tipo_calculo_aplicacao_desconto, solicita_justificativa,
                    desconto_fidelidade, status
                ) VALUES (
                    @motivo_id, @descricao, @tipo_aplicacao_desconto,
                    @tipo_calculo_aplicacao_desconto, @solicita_justificativa,
                    @desconto_fidelidade, @status
                )
                ON CONFLICT(motivo_id) DO UPDATE SET
                    descricao  = excluded.descricao,
                    tipo_aplicacao_desconto = excluded.tipo_aplicacao_desconto,
                    tipo_calculo_aplicacao_desconto = excluded.tipo_calculo_aplicacao_desconto,
                    solicita_justificativa = excluded.solicita_justificativa,
                    desconto_fidelidade = excluded.desconto_fidelidade,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (m) => [{
                motivo_id:                        m.id                              ?? null,
                descricao:                        m.descricao                       ?? null,
                tipo_aplicacao_desconto:          m.tipoAplicacaoDesconto           ?? null,
                tipo_calculo_aplicacao_desconto:  m.tipoCalculoAplicacaoDesconto    ?? null,
                solicita_justificativa:           BaseRepository._bool(m.solicitaJustificativa),
                desconto_fidelidade:              BaseRepository._bool(m.descontoFidelidade),
                status: 'U'
            }]
        );
    }

    // ─── MOTIVOS DEVOLUÇÃO ────────────────────────────────────────────────────

    static importarMotivosDevolucao(motivos) {
        return BaseRepository._executarTransacao(
            'motivos de devolução',
            motivos,
            (db) => db.prepare(`
                INSERT INTO motivos_devolucao (
                    motivo_id, descricao, status
                ) VALUES (
                    @motivo_id, @descricao, @status
                )
                ON CONFLICT(motivo_id) DO UPDATE SET
                    descricao  = excluded.descricao,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (m) => [{
                motivo_id: m.id        ?? null,
                descricao: m.descricao ?? null,
                status: 'U'
            }]
        );
    }

    // ─── MOTIVOS CANCELAMENTO ─────────────────────────────────────────────────

    static importarMotivosCancelamento(motivos) {
        return BaseRepository._executarTransacao(
            'motivos de cancelamento',
            motivos,
            (db) => db.prepare(`
                INSERT INTO motivos_cancelamento (
                    motivo_id, descricao, tipo_aplicacao,
                    solicita_justificativa, status
                ) VALUES (
                    @motivo_id, @descricao, @tipo_aplicacao,
                    @solicita_justificativa, @status
                )
                ON CONFLICT(motivo_id) DO UPDATE SET
                    descricao  = excluded.descricao,
                    tipo_aplicacao = excluded.tipo_aplicacao,
                    solicita_justificativa = excluded.solicita_justificativa,
                    updated_at = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (m) => [{
                motivo_id:              m.id              ?? null,
                descricao:              m.descricao       ?? null,
                tipo_aplicacao:         m.tipoAplicacao   ?? null,
                solicita_justificativa: BaseRepository._bool(m.solicitaJustificativa),
                status: 'U'
            }]
        );
    }

}

module.exports = FrenteLojaRepository;