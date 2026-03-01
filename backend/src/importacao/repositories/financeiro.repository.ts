// backend/src/importacao/repositories/financeiro.repository.ts

import { Injectable } from '@nestjs/common';
import { SqliteService } from '../../database/sqlite.service';
import { SqliteMapper as M } from '../../common/sqlite-mapper';

/**
 * FinanceiroRepository
 * Gerencia: categorias, agentes, contas_correntes,
 * especies_documentos, historico_padrao.
 * Porta direta de financeiro.js — lógica SQL preservada integralmente.
 */
@Injectable()
export class FinanceiroRepository {

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

  // ─── CATEGORIAS ───────────────────────────────────────────────────────────

  importarCategorias(categorias: any[]) {
    return this.upsert(
      categorias,
      `INSERT INTO categorias (
         categoria_id, descricao, categoria_pai_id,
         codigo_contabil, inativa, posicao,
         classificacao, tipo, status
       ) VALUES (
         @categoria_id, @descricao, @categoria_pai_id,
         @codigo_contabil, @inativa, @posicao,
         @classificacao, @tipo, @status
       )
       ON CONFLICT(categoria_id) DO UPDATE SET
         descricao        = excluded.descricao,
         categoria_pai_id = excluded.categoria_pai_id,
         codigo_contabil  = excluded.codigo_contabil,
         inativa          = excluded.inativa,
         posicao          = excluded.posicao,
         classificacao    = excluded.classificacao,
         tipo             = excluded.tipo,
         updated_at       = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (c) => ({
        categoria_id:     c.id                       ?? null,
        descricao:        c.descricao                ?? null,
        categoria_pai_id: c.codigoDaCategoriaPai     ?? null,
        codigo_contabil:  c.codigoContabilExterno    ?? null,
        inativa:          M.bool(c.inativa),
        posicao:          c.posicao                  ?? null,
        classificacao:    c.classificacaoDaCategoria ?? null,
        tipo:             c.tipoDeCategoria          ?? null,
        status:           'U',
      }),
    );
  }

  // ─── AGENTES ──────────────────────────────────────────────────────────────

  importarAgentes(agentes: any[]) {
    return this.upsert(
      agentes,
      `INSERT INTO agentes (
         agente_id, nome, fantasia, codigo_do_banco, tipo,
         documento, tipo_contribuinte, inscricao_estadual,
         telefone1, holding_id,
         cep, logradouro, numero, bairro,
         municipio, ibge, uf, pais, tipo_de_endereco, status
       ) VALUES (
         @agente_id, @nome, @fantasia, @codigo_do_banco, @tipo,
         @documento, @tipo_contribuinte, @inscricao_estadual,
         @telefone1, @holding_id,
         @cep, @logradouro, @numero, @bairro,
         @municipio, @ibge, @uf, @pais, @tipo_de_endereco, @status
       )
       ON CONFLICT(agente_id) DO UPDATE SET
         nome               = excluded.nome,
         fantasia           = excluded.fantasia,
         codigo_do_banco    = excluded.codigo_do_banco,
         tipo               = excluded.tipo,
         documento          = excluded.documento,
         tipo_contribuinte  = excluded.tipo_contribuinte,
         inscricao_estadual = excluded.inscricao_estadual,
         telefone1          = excluded.telefone1,
         holding_id         = excluded.holding_id,
         cep                = excluded.cep,
         logradouro         = excluded.logradouro,
         numero             = excluded.numero,
         bairro             = excluded.bairro,
         municipio          = excluded.municipio,
         ibge               = excluded.ibge,
         uf                 = excluded.uf,
         pais               = excluded.pais,
         tipo_de_endereco   = excluded.tipo_de_endereco,
         updated_at         = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (a) => ({
        agente_id:          a.id                                              ?? null,
        nome:               a.nome                                            ?? null,
        fantasia:           a.fantasia                                        ?? null,
        codigo_do_banco:    a.codigoDoBanco                                   ?? null,
        tipo:               a.tipo                                            ?? null,
        documento:          a.numeroDoDocumento                               ?? null,
        tipo_contribuinte:  a.tipoContribuinte                                ?? null,
        inscricao_estadual: a.numeroDeIdentificacao                           ?? null,
        telefone1:          a.telefone1                                       ?? null,
        holding_id:         a.holdingId                                       ?? null,
        cep:                (a.endereco?.cep ?? '').replace('-', '') || null,
        logradouro:         a.endereco?.logradouro                            ?? null,
        numero:             a.endereco?.numero                                ?? null,
        bairro:             a.endereco?.bairro                                ?? null,
        municipio:          a.endereco?.municipio                             ?? null,
        ibge:               a.endereco?.codigoIbge                           ?? null,
        uf:                 a.endereco?.uf                                    ?? null,
        pais:               a.endereco?.codigoDoPais                         ?? null,
        tipo_de_endereco:   a.endereco?.tipoDeEndereco                       ?? null,
        status:             'U',
      }),
    );
  }

  // ─── CONTAS CORRENTES ─────────────────────────────────────────────────────

  importarContasCorrentes(contas: any[]) {
    return this.upsert(
      contas,
      `INSERT INTO contas_correntes (
         conta_id, descricao, tipo, ativa,
         compoe_fluxo_caixa, lancamento_consolidado,
         loja_id, nome_loja, agente_financeiro_id,
         nome_banco, codigo_banco, agencia, conta,
         local_de_pagamento, identificacao_ofx, status
       ) VALUES (
         @conta_id, @descricao, @tipo, @ativa,
         @compoe_fluxo_caixa, @lancamento_consolidado,
         @loja_id, @nome_loja, @agente_financeiro_id,
         @nome_banco, @codigo_banco, @agencia, @conta,
         @local_de_pagamento, @identificacao_ofx, @status
       )
       ON CONFLICT(conta_id) DO UPDATE SET
         descricao              = excluded.descricao,
         tipo                   = excluded.tipo,
         ativa                  = excluded.ativa,
         compoe_fluxo_caixa     = excluded.compoe_fluxo_caixa,
         lancamento_consolidado = excluded.lancamento_consolidado,
         loja_id                = excluded.loja_id,
         nome_loja              = excluded.nome_loja,
         agente_financeiro_id   = excluded.agente_financeiro_id,
         nome_banco             = excluded.nome_banco,
         codigo_banco           = excluded.codigo_banco,
         agencia                = excluded.agencia,
         conta                  = excluded.conta,
         local_de_pagamento     = excluded.local_de_pagamento,
         identificacao_ofx      = excluded.identificacao_ofx,
         updated_at             = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (c) => ({
        conta_id:               c.id                                                        ?? null,
        descricao:              c.descricao                                                 ?? null,
        tipo:                   c.tipo                                                      ?? null,
        ativa:                  M.bool(c.ativa),
        compoe_fluxo_caixa:     M.bool(c.compoeFluxoDeCaixa),
        lancamento_consolidado: M.bool(c.lancamentoConsolidadoLiquidacaoMultipla),
        loja_id:                c.lojaId                                                    ?? null,
        nome_loja:              c.nomeLoja                                                  ?? null,
        agente_financeiro_id:   c.agenteFinanceiroId                                        ?? null,
        nome_banco:             c.nomeBanco                                                 ?? null,
        codigo_banco:           c.codigoBanco                                               ?? null,
        agencia:                c.agencia                                                   ?? null,
        conta:                  c.conta                                                     ?? null,
        local_de_pagamento:     c.localDePagamento                                          ?? null,
        identificacao_ofx:      c.identificacaoContaCorrenteOFX                             ?? null,
        status:                 'U',
      }),
    );
  }

  // ─── ESPÉCIES DE DOCUMENTO ────────────────────────────────────────────────

  importarEspeciesDocumento(especies: any[]) {
    return this.upsert(
      especies,
      `INSERT INTO especies_documentos (
         especie_id, descricao, sigla, genero, especie_nfe,
         modalidade, dias_para_juros, tipo_valor_mora_diaria,
         mora_diaria_por_atraso, dias_para_multa, tipo_valor_multa,
         valor_multa_por_atraso, emite_documento_vinculado,
         quantidade_vias, quantidade_autenticacoes,
         especie_pdv, controla_limite_credito, tipo, status
       ) VALUES (
         @especie_id, @descricao, @sigla, @genero, @especie_nfe,
         @modalidade, @dias_para_juros, @tipo_valor_mora_diaria,
         @mora_diaria_por_atraso, @dias_para_multa, @tipo_valor_multa,
         @valor_multa_por_atraso, @emite_documento_vinculado,
         @quantidade_vias, @quantidade_autenticacoes,
         @especie_pdv, @controla_limite_credito, @tipo, @status
       )
       ON CONFLICT(especie_id) DO UPDATE SET
         descricao                 = excluded.descricao,
         sigla                     = excluded.sigla,
         genero                    = excluded.genero,
         especie_nfe               = excluded.especie_nfe,
         modalidade                = excluded.modalidade,
         dias_para_juros           = excluded.dias_para_juros,
         tipo_valor_mora_diaria    = excluded.tipo_valor_mora_diaria,
         mora_diaria_por_atraso    = excluded.mora_diaria_por_atraso,
         dias_para_multa           = excluded.dias_para_multa,
         tipo_valor_multa          = excluded.tipo_valor_multa,
         valor_multa_por_atraso    = excluded.valor_multa_por_atraso,
         emite_documento_vinculado = excluded.emite_documento_vinculado,
         quantidade_vias           = excluded.quantidade_vias,
         quantidade_autenticacoes  = excluded.quantidade_autenticacoes,
         especie_pdv               = excluded.especie_pdv,
         controla_limite_credito   = excluded.controla_limite_credito,
         tipo                      = excluded.tipo,
         updated_at                = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (e) => ({
        especie_id:                  e.id                                 ?? null,
        descricao:                   e.descricao                          ?? null,
        sigla:                       e.sigla                              ?? null,
        genero:                      e.genero                             ?? null,
        especie_nfe:                 e.especieDocumentoNFe                ?? null,
        modalidade:                  e.modalidade                         ?? null,
        dias_para_juros:             e.diasParaIncidenciaDeJuros          ?? null,
        tipo_valor_mora_diaria:      e.tipoValorMoraDiaria                ?? null,
        mora_diaria_por_atraso:      e.moraDiariaPorAtraso                ?? null,
        dias_para_multa:             e.diasParaIncidenciaDeMulta          ?? null,
        tipo_valor_multa:            e.tipoValorMulta                     ?? null,
        valor_multa_por_atraso:      e.valorMultaPorAtraso                ?? null,
        emite_documento_vinculado:   M.bool(e.emiteDocumentoVinculado),
        quantidade_vias:             e.quantidadeDeVias                   ?? null,
        quantidade_autenticacoes:    e.quantidadeDeAutenticacoes          ?? null,
        especie_pdv:                 e.especiePDV                         ?? null,
        controla_limite_credito:     M.bool(e.controlaLimiteDeCredito),
        tipo:                        e.tipo                               ?? null,
        status:                      'U',
      }),
    );
  }

  // ─── HISTÓRICO PADRÃO ─────────────────────────────────────────────────────

  importarHistoricoPadrao(historicos: any[]) {
    return this.upsert(
      historicos,
      `INSERT INTO historico_padrao (historico_id, descricao, tipo, status)
       VALUES (@historico_id, @descricao, @tipo, @status)
       ON CONFLICT(historico_id) DO UPDATE SET
         descricao  = excluded.descricao,
         tipo       = excluded.tipo,
         updated_at = CURRENT_TIMESTAMP
       WHERE status NOT IN ('C', 'D')`,
      (h) => ({
        historico_id: h.id        ?? null,
        descricao:    h.descricao ? h.descricao.trim() : null,
        tipo:         h.tipo      ?? null,
        status:       'U',
      }),
    );
  }
}
