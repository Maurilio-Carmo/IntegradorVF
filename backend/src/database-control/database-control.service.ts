// backend/src/database-control/database-control.service.ts
// MIGRADO: cria tabelas via Drizzle migrations, não mais via SQL raw
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable as Inj, Logger as Log } from '@nestjs/common';
import { sql }                               from 'drizzle-orm';
import { DrizzleService as DS }              from '../database/drizzle.service';
import { AppLoggerService }                  from '../logger/logger.service';
import * as schema                           from '../database/schema';

const TODAS_TABELAS = [
  'secoes', 'grupos', 'subgrupos', 'marcas', 'familias',
  'produtos', 'produto_auxiliares', 'produto_fornecedores',
  'produto_min_max', 'produto_regimes', 'produto_componentes',
  'produto_impostos_federais',
  'categorias', 'agentes', 'contas_correntes',
  'especies_documentos', 'historico_padrao',
  'formas_pagamento', 'pagamentos_pdv', 'recebimentos_pdv',
  'motivos_desconto', 'motivos_devolucao', 'motivos_cancelamento',
  'local_estoque', 'tipos_ajustes', 'saldo_estoque',
  'regime_tributario', 'situacoes_fiscais', 'tipos_operacoes',
  'impostos_federais', 'tabelas_tributarias', 'cenarios_fiscais',
  'cenarios_fiscais_ncms',
  'lojas', 'clientes', 'fornecedores',
  'credenciais', 'sync_historico',
];

@Inj()
export class DatabaseControlService {
  private readonly log = new Log(DatabaseControlService.name);

  constructor(
    private readonly drizzle: DS,
    private readonly logger:  AppLoggerService,
  ) {}

  /**
   * Limpa todos os dados (mantém estrutura).
   * Com Drizzle, o schema é gerenciado por migrations — não há mais
   * necessidade de criarTabelas() manual.
   */
  async limparDados() {
    let limpas = 0;

    this.drizzle.db.transaction((tx) => {
      for (const tabela of TODAS_TABELAS) {
        try {
          tx.run(sql.raw(`DELETE FROM ${tabela}`));
          limpas++;
        } catch { /* tabela pode não existir ainda */ }
      }
    });

    this.logger.info(`Dados limpos: ${limpas} tabelas`, 'DatabaseControl');
    return { success: true, tabelas_limpas: limpas };
  }

  /** Retorna contagem de registros por tabela */
  async obterEstatisticas() {
    const stats: Record<string, number | null> = {};

    for (const tabela of TODAS_TABELAS) {
      try {
        const row = this.drizzle.db
          .get<{ total: number }>(sql.raw(`SELECT COUNT(*) as total FROM ${tabela}`));
        stats[tabela] = (row as any)?.total ?? 0;
      } catch {
        stats[tabela] = null;
      }
    }

    return { timestamp: new Date().toISOString(), tabelas: stats };
  }
}