// backend/src/modules/sqlite-repository/repositories/frente-loja.js

const BaseRepository = require('../base-repository');

/**
 * FrenteLojaRepository
 * Gerencia: formas de pagamento, pagamentos PDV, recebimentos PDV,
 * motivos (desconto/cancelamento/devolução).
 */

class FrenteLojaRepository extends BaseRepository {
    // ─── FORMAS DE PAGAMENTO ──────────────────────────────────────────────────

    static importarFormasPagamento(formasPagamento) {
        return BaseRepository._executarTransacao(
            'formas de pagamento',
            formasPagamento,
            (db) => db.prepare(`
                INSERT INTO formas_pagamento (
                    forma_pagamento_id, descricao,
                    especie_de_documento_id, categoria_financeira_id, agente_financeiro_id,
                    controle_de_cartao, movimenta_conta_corrente, ativa,
                    conta_corrente_id,
                    status
                ) VALUES (
                    @forma_pagamento_id, @descricao,
                    @especie_de_documento_id, @categoria_financeira_id, @agente_financeiro_id,
                    @controle_de_cartao, @movimenta_conta_corrente, @ativa,
                    @conta_corrente_id,
                    'U'
                )
                ON CONFLICT(forma_pagamento_id) DO UPDATE SET
                    descricao                = excluded.descricao,
                    especie_de_documento_id  = excluded.especie_de_documento_id,
                    categoria_financeira_id  = excluded.categoria_financeira_id,
                    agente_financeiro_id     = excluded.agente_financeiro_id,
                    controle_de_cartao       = excluded.controle_de_cartao,
                    movimenta_conta_corrente = excluded.movimenta_conta_corrente,
                    ativa                    = excluded.ativa,
                    conta_corrente_id        = excluded.conta_corrente_id,
                    updated_at               = CURRENT_TIMESTAMP
                WHERE status NOT IN ('C', 'D')
            `),
            (f) => [{
                forma_pagamento_id:       f.formaPagamentoId          ?? null,
                descricao:                f.descricao                 ?? null,
                especie_de_documento_id:  f.especieDeDocumentoId      ?? null,
                categoria_financeira_id:  f.categoriaFinanceiraId     ?? null,
                agente_financeiro_id:     f.agenteFinanceiroId        ?? null,
                controle_de_cartao:       BaseRepository._bool(f.controleDeCartao),
                movimenta_conta_corrente: BaseRepository._bool(f.movimentaContaCorrente),
                ativa:                    BaseRepository._bool(f.ativa),
                conta_corrente_id:        f.contaCorrenteId           ?? null,
            }]
        );
    }

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