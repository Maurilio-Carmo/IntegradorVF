// backend/src/importacao/importacao.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SqliteService } from '../database/sqlite.service';

/**
 * ImportacaoController
 * Expõe endpoints gerais do módulo de importação.
 * GET /api/importacao/estatisticas → contagem de registros por tabela.
 * Implementado diretamente com SqliteService — sem bridge CJS.
 */
@ApiTags('Importação · Utils')
@Controller('api/importacao')
export class ImportacaoController {

  private readonly TABELAS = [
    // Produto / Mercadológica
    'secoes', 'grupos', 'subgrupos',
    'marcas', 'familias', 'produtos',
    'produto_min_max', 'produto_regimes', 'produto_componentes',
    'produto_impostos_federais', 'produto_auxiliares', 'produto_fornecedores',
    // Financeiro
    'categorias', 'agentes', 'contas_correntes',
    'especies_documentos', 'historico_padrao',
    // Frente de Loja / PDV
    'formas_pagamento', 'pagamentos_pdv', 'recebimentos_pdv',
    'motivos_desconto', 'motivos_devolucao', 'motivos_cancelamento',
    // Fiscal
    'regime_tributario', 'situacoes_fiscais', 'tipos_operacoes',
    'impostos_federais', 'tabelas_tributarias', 'cenarios_fiscais',
    // Estoque
    'local_estoque', 'tipos_ajustes', 'saldo_estoque',
    // Pessoa
    'lojas', 'clientes', 'fornecedores',
  ];

  constructor(private readonly sqlite: SqliteService) {}

  @Get('estatisticas')
  @ApiOperation({ summary: 'Contagem de registros por tabela no SQLite' })
  estatisticas(): Record<string, number> {
    return this.TABELAS.reduce((acc, tabela) => {
      try {
        const row = this.sqlite.get<{ total: number }>(
          `SELECT COUNT(*) as total FROM ${tabela}`,
        );
        acc[tabela] = row?.total ?? 0;
      } catch {
        acc[tabela] = 0;
      }
      return acc;
    }, {} as Record<string, number>);
  }
}
