// backend/src/importacao/repositories/frente-loja.repository.ts

import { Injectable } from '@nestjs/common';
import { SqliteService } from '../../database/sqlite.service';
import { SqliteMapper as M } from '../../common/sqlite-mapper';

/**
 * FrenteLojaRepository
 * Gerencia: formas_pagamento, pagamentos_pdv, recebimentos_pdv,
 * motivos_desconto, motivos_devolucao, motivos_cancelamento.
 * Porta direta de frente-loja.js — lógica SQL preservada integralmente.
 */
@Injectable()
export class FrenteLojaRepository {

  constructor(private readonly sqlite: SqliteService) {}

  private upsert(
    items: any[],
    sql: string,
    mapper: (item: any) => Record<string, any>,
  ): { success: boolean; count: number } {
    if (!items?.length) return { success: true, count: 0 };

    const stmt = this.sqlite.getDb().prepare(sql);
    this.sqlite.transaction(() => {
      for (const item of items) stmt.run(mapper(item));
    });

    return { success: true, count: items.length };
  }

  // ─── FORMAS DE PAGAMENTO ──────────────────────────────────────────────────

  importarFormasPagamento(formasPagamento: any[]) {
    return this.upsert(
      formasPagamento,
      `INSERT INTO formas_pagamento (
         forma_pagamento_id, descricao,
         especie_de_documento_id, categoria_financeira_id, agente_financeiro_id,
         controle_de_cartao, movimenta_conta_corrente, ativa,
         conta_corrente_id, status
       ) VALUES (
         @forma_pagamento_id, @descricao,
         @especie_de_documento_id, @categoria_financeira_id, @agente_financeiro_id,
         @controle_de_cartao, @movimenta_conta_corrente, @ativa,
         @conta_corrente_id, 'U'
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
       WHERE status NOT IN ('C', 'D')`,
      (f) => ({
        forma_pagamento_id:       f.formaPagamentoId         ?? null,
        descricao:                f.descricao                ?? null,
        especie_de_documento_id:  f.especieDeDocumentoId     ?? null,
        categoria_financeira_id:  f.categoriaFinanceiraId    ?? null,
        agente_financeiro_id:     f.agenteFinanceiroId       ?? null,
        controle_de_cartao:       M.bool(f.controleDeCartao),
        movimenta_conta_corrente: M.bool(f.movimentaContaCorrente),
        ativa:                    M.bool(f.ativa),
        conta_corrente_id:        f.contaCorrenteId          ?? null,
      }),
    );
  }

  // ─── PAGAMENTOS PDV ───────────────────────────────────────────────────────

  importarPagamentosPDV(pagamentos: any[]) {
    return this.upsert(
      pagamentos,
      `INSERT INTO pagamentos_pdv (
         pagamento_id, descricao, categoria_id, loja_id, valor_maximo, status
       ) VALUES (
         @pagamento_id, @descricao, @categoria_id, @loja_id, @valor_maximo, @status
       )
       ON CONFLICT(pagamento_id) DO UPDATE SET
         descricao    = excluded.descricao,
         categoria_id = excluded.categoria_id,
         loja_id      = excluded.loja_id,
         valor_maximo = excluded.valor_maximo,
         updated_at   = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (p) => ({
        pagamento_id: p.id          ?? null,
        descricao:    p.descricao   ?? null,
        categoria_id: p.categoriaId ?? null,
        loja_id:      p.lojaId      ?? null,
        valor_maximo: p.valorMaximo ?? null,
        status:       'U',
      }),
    );
  }

  // ─── RECEBIMENTOS PDV ─────────────────────────────────────────────────────

  importarRecebimentosPDV(recebimentos: any[]) {
    return this.upsert(
      recebimentos,
      `INSERT INTO recebimentos_pdv (
         recebimento_id, descricao, categoria_id,
         loja_id, tipo_recebimento, qtd_autenticacoes,
         imprime_doc, qtd_impressoes, valor_recebimento, status
       ) VALUES (
         @recebimento_id, @descricao, @categoria_id,
         @loja_id, @tipo_recebimento, @qtd_autenticacoes,
         @imprime_doc, @qtd_impressoes, @valor_recebimento, @status
       )
       ON CONFLICT(recebimento_id) DO UPDATE SET
         descricao         = excluded.descricao,
         categoria_id      = excluded.categoria_id,
         loja_id           = excluded.loja_id,
         tipo_recebimento  = excluded.tipo_recebimento,
         qtd_autenticacoes = excluded.qtd_autenticacoes,
         imprime_doc       = excluded.imprime_doc,
         qtd_impressoes    = excluded.qtd_impressoes,
         valor_recebimento = excluded.valor_recebimento,
         updated_at        = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (r) => ({
        recebimento_id:    r.id                 ?? null,
        descricao:         r.descricao          ?? null,
        categoria_id:      r.categoriaId        ?? null,
        loja_id:           r.lojaId             ?? null,
        tipo_recebimento:  r.tipoRecebimento    ?? null,
        qtd_autenticacoes: r.qtdAutenticacoes   ?? 0,
        imprime_doc:       M.bool(r.imprimeDoc),
        qtd_impressoes:    r.qtdImpressoes      ?? 0,
        valor_recebimento: r.valorRecebimento   ?? 0,
        status:            'U',
      }),
    );
  }

  // ─── MOTIVOS DE DESCONTO ──────────────────────────────────────────────────

  importarMotivosDesconto(motivos: any[]) {
    return this.upsert(
      motivos,
      `INSERT INTO motivos_desconto (
         motivo_id, descricao, tipo_aplicacao_desconto,
         tipo_calculo_aplicacao_desconto, solicita_justificativa,
         desconto_fidelidade, status
       ) VALUES (
         @motivo_id, @descricao, @tipo_aplicacao_desconto,
         @tipo_calculo_aplicacao_desconto, @solicita_justificativa,
         @desconto_fidelidade, @status
       )
       ON CONFLICT(motivo_id) DO UPDATE SET
         descricao                       = excluded.descricao,
         tipo_aplicacao_desconto         = excluded.tipo_aplicacao_desconto,
         tipo_calculo_aplicacao_desconto = excluded.tipo_calculo_aplicacao_desconto,
         solicita_justificativa          = excluded.solicita_justificativa,
         desconto_fidelidade             = excluded.desconto_fidelidade,
         updated_at                      = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (m) => ({
        motivo_id:                       m.id                             ?? null,
        descricao:                       m.descricao                      ?? null,
        tipo_aplicacao_desconto:         m.tipoAplicacaoDesconto          ?? null,
        tipo_calculo_aplicacao_desconto: m.tipoCalculoAplicacaoDesconto   ?? null,
        solicita_justificativa:          M.bool(m.solicitaJustificativa),
        desconto_fidelidade:             M.bool(m.descontoFidelidade),
        status:                          'U',
      }),
    );
  }

  // ─── MOTIVOS DE DEVOLUÇÃO ─────────────────────────────────────────────────

  importarMotivosDevolucao(motivos: any[]) {
    return this.upsert(
      motivos,
      `INSERT INTO motivos_devolucao (motivo_id, descricao, status)
       VALUES (@motivo_id, @descricao, @status)
       ON CONFLICT(motivo_id) DO UPDATE SET
         descricao  = excluded.descricao,
         updated_at = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (m) => ({
        motivo_id: m.id        ?? null,
        descricao: m.descricao ?? null,
        status:    'U',
      }),
    );
  }

  // ─── MOTIVOS DE CANCELAMENTO ──────────────────────────────────────────────

  importarMotivosCancelamento(motivos: any[]) {
    return this.upsert(
      motivos,
      `INSERT INTO motivos_cancelamento (
         motivo_id, descricao, tipo_aplicacao, solicita_justificativa, status
       ) VALUES (
         @motivo_id, @descricao, @tipo_aplicacao, @solicita_justificativa, @status
       )
       ON CONFLICT(motivo_id) DO UPDATE SET
         descricao              = excluded.descricao,
         tipo_aplicacao         = excluded.tipo_aplicacao,
         solicita_justificativa = excluded.solicita_justificativa,
         updated_at             = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (m) => ({
        motivo_id:              m.id              ?? null,
        descricao:              m.descricao       ?? null,
        tipo_aplicacao:         m.tipoAplicacao   ?? null,
        solicita_justificativa: M.bool(m.solicitaJustificativa),
        status:                 'U',
      }),
    );
  }
}
