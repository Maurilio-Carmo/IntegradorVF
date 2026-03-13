// backend/src/sincronizacao/sincronizacao.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, inArray, desc }               from 'drizzle-orm';
import { DrizzleService }                  from '../database/drizzle.service';
import { AppLoggerService }                from '../logger/logger.service';
import { syncHistorico }                   from '../database/schema';
import { DOMINIOS_VALIDOS }                from './dto/executar-sync.dto';
import * as schema                         from '../database/schema';

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface ApiConfig {
  apiUrl: string;
  apiKey: string;
}

interface ResultadoSync {
  criados:    number;
  atualizados: number;
  deletados:  number;
  erros:      number;
  total:      number;
}

// ─── Mapa domínio → tabela Drizzle ────────────────────────────────────────────
// CORREÇÃO: expandido para cobrir todos os domínios válidos.
// Cada entrada deve ter correspondência no mapa PKS abaixo.

const DOMINIO_TABELA: Record<string, any> = {
  // Produto / Mercadológica
  secoes:               schema.secoes,
  grupos:               schema.grupos,
  subgrupos:            schema.subgrupos,
  marcas:               schema.marcas,
  familias:             schema.familias,
  produtos:             schema.produtos,
  produto_auxiliares:   schema.produtoAuxiliares,
  produto_fornecedores: schema.produtoFornecedores,

  // Financeiro
  categorias:           schema.categorias,
  agentes:              schema.agentes,
  contas_correntes:     schema.contasCorrentes,
  especies_documentos:  schema.especiesDocumentos,
  historico_padrao:     schema.historicoPadrao,
  formas_pagamento:     schema.formasPagamento,

  // Frente de Loja / PDV
  pagamentos_pdv:       schema.pagamentosPdv,
  recebimentos_pdv:     schema.recebimentosPdv,
  motivos_desconto:     schema.motivosDesconto,
  motivos_devolucao:    schema.motivosDevolucao,
  motivos_cancelamento: schema.motivosCancelamento,

  // Estoque
  local_estoque:        schema.localEstoque,
  tipos_ajustes:        schema.tiposAjustes,
  saldo_estoque:        schema.saldoEstoque,

  // Fiscal
  regime_tributario:    schema.regimeTributario,
  situacoes_fiscais:    schema.situacoesFiscais,
  tipos_operacoes:      schema.tiposOperacoes,
  impostos_federais:    schema.impostosFederais,
  tabelas_tributarias:  schema.tabelasTributarias,
  cenarios_fiscais:     schema.cenariosFiscais,

  // Pessoa
  lojas:                schema.lojas,
  clientes:             schema.clientes,
  fornecedores:         schema.fornecedores,
};

// ─── Mapa domínio → coluna PK Drizzle ────────────────────────────────────────
// CORREÇÃO CRÍTICA: todos os domínios de DOMINIO_TABELA devem ter entrada aqui.
// Antes, domínios como subgrupos/marcas/familias retornavam undefined
// causando "Cannot read properties of undefined" no .where(eq(pkField, ...)).

const DOMINIO_PK: Record<string, any> = {
  // Produto / Mercadológica
  secoes:               schema.secoes.secaoId,
  grupos:               schema.grupos.grupoId,
  subgrupos:            schema.subgrupos.subgrupoId,
  marcas:               schema.marcas.marcaId,
  familias:             schema.familias.familiaId,
  produtos:             schema.produtos.produtoId,
  produto_auxiliares:   schema.produtoAuxiliares.produtoId,    // FK para produtos
  produto_fornecedores: schema.produtoFornecedores.produtoId,  // FK para produtos

  // Financeiro
  categorias:           schema.categorias.categoriaId,
  agentes:              schema.agentes.agenteId,
  contas_correntes:     schema.contasCorrentes.contaId,
  especies_documentos:  schema.especiesDocumentos.especieId,
  historico_padrao:     schema.historicoPadrao.historicoId,
  formas_pagamento:     schema.formasPagamento.formaPagamentoId,

  // Frente de Loja / PDV
  pagamentos_pdv:       schema.pagamentosPdv.pagamentoId,
  recebimentos_pdv:     schema.recebimentosPdv.recebimentoId,
  motivos_desconto:     schema.motivosDesconto.motivoId,
  motivos_devolucao:    schema.motivosDevolucao.motivoId,
  motivos_cancelamento: schema.motivosCancelamento.motivoId,

  // Estoque
  local_estoque:        schema.localEstoque.localId,
  tipos_ajustes:        schema.tiposAjustes.tipoAjusteId,
  saldo_estoque:        schema.saldoEstoque.produtoId,

  // Fiscal
  regime_tributario:    schema.regimeTributario.regimeId,
  situacoes_fiscais:    schema.situacoesFiscais.situacaoId,
  tipos_operacoes:      schema.tiposOperacoes.operacaoId,
  impostos_federais:    schema.impostosFederais.impostoId,
  tabelas_tributarias:  schema.tabelasTributarias.tabelaId,
  cenarios_fiscais:     schema.cenariosFiscais.cenarioId,

  // Pessoa
  lojas:                schema.lojas.lojaId,
  clientes:             schema.clientes.clienteId,
  fornecedores:         schema.fornecedores.fornecedorId,
};

// Timeout padrão para chamadas à API externa (ms)
const API_TIMEOUT_MS = 15_000;

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class SincronizacaoService {

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly logger:  AppLoggerService,
  ) {}

  // ─── API Pública ──────────────────────────────────────────────────────────

  listarPendentes(dominio: string) {
    this.validarDominio(dominio);
    const tabela = this.resolverTabela(dominio);

    const registros = this.drizzle.db
      .select()
      .from(tabela)
      .where(inArray((tabela as any).status, ['C', 'U', 'D']))
      .orderBy((tabela as any).updatedAt)
      .all();

    return { dominio, total: registros.length, registros };
  }

  async executarSincronizacao(dominio: string, apiConfig: ApiConfig) {
    this.validarDominio(dominio);
    this.validarApiConfig(apiConfig);

    const inicio  = Date.now();
    const tabela  = this.resolverTabela(dominio);

    const pendentes = this.drizzle.db
      .select()
      .from(tabela)
      .where(inArray((tabela as any).status, ['C', 'U', 'D']))
      .orderBy((tabela as any).updatedAt)
      .all();

    this.logger.info(
      `Sync ${dominio}: ${pendentes.length} registros pendentes`,
      'Sincronizacao',
    );

    const resultado: ResultadoSync = {
      criados: 0, atualizados: 0, deletados: 0, erros: 0,
      total: pendentes.length,
    };

    for (const registro of pendentes as any[]) {
      await this.processarRegistro(dominio, registro, apiConfig, resultado);
    }

    const duracao = Date.now() - inicio;
    this.salvarHistorico(dominio, resultado, duracao);
    this.logger.success(
      `Sync ${dominio} concluído em ${duracao}ms`,
      'Sincronizacao',
      resultado,
    );

    return { ...resultado, duracao_ms: duracao, dominio };
  }

  async reprocessarRegistro(
    dominio:   string,
    id:        string,
    apiConfig: ApiConfig,
  ) {
    this.validarDominio(dominio);
    this.validarApiConfig(apiConfig);

    const tabela  = this.resolverTabela(dominio);
    const pkField = this.resolverPk(dominio);

    const registro = this.drizzle.db
      .select()
      .from(tabela)
      .where(eq(pkField, id))
      .get();

    if (!registro) {
      throw new BadRequestException(`Registro ${id} não encontrado em ${dominio}`);
    }
    if ((registro as any).status !== 'E') {
      throw new BadRequestException(`Registro ${id} não está com status E (atual: ${(registro as any).status})`);
    }

    const resultado: ResultadoSync = {
      criados: 0, atualizados: 0, deletados: 0, erros: 0, total: 1,
    };
    await this.processarRegistro(dominio, registro, apiConfig, resultado);
    return resultado;
  }

  /** Retorna as últimas N execuções de sincronização registradas */
  obterHistorico(limit = 50) {
    const rows = this.drizzle.db
      .select()
      .from(syncHistorico)
      .orderBy(desc(syncHistorico.id))
      .limit(limit)
      .all();

    return rows.map(r => ({
      ...r,
      resultado: r.resultado ? JSON.parse(r.resultado) : null,
    }));
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  /**
   * Processa um único registro: envia para a API e atualiza o status no SQLite.
   *
   * CORREÇÃO [2]: fetch com AbortController + timeout de 15s.
   * CORREÇÃO [3]: pkValue lido via resolverPk() em vez de Object.keys()[0].
   */
  private async processarRegistro(
    dominio:   string,
    registro:  any,
    apiConfig: ApiConfig,
    resultado: ResultadoSync,
  ): Promise<void> {
    const tabela  = this.resolverTabela(dominio);
    const pkField = this.resolverPk(dominio);

    // CORREÇÃO [3]: usar o nome da coluna PK para ler o valor correto.
    // pkField é uma coluna Drizzle — seu .name contém o nome da coluna SQL.
    const pkColumnName = pkField.name as string;
    const pkValue      = registro[pkColumnName];

    if (pkValue === undefined || pkValue === null) {
      this.logger.warn(
        `Registro sem PK legível em ${dominio} (coluna: ${pkColumnName})`,
        'Sincronizacao',
      );
      resultado.erros++;
      return;
    }

    try {
      const { apiUrl, apiKey } = apiConfig;

      // CORREÇÃO [2]: AbortController com timeout de 15s
      const ctrl   = new AbortController();
      const timer  = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);
      const signal = ctrl.signal;

      const fetchOpts = (method: string, body?: object): RequestInit => ({
        method,
        signal,
        headers: {
          Authorization:  `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept:         'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      try {
        if (registro.status === 'C') {
          await fetch(`${apiUrl}/${dominio}`, fetchOpts('POST', registro));
          resultado.criados++;
        } else if (registro.status === 'U') {
          await fetch(`${apiUrl}/${dominio}/${pkValue}`, fetchOpts('PUT', registro));
          resultado.atualizados++;
        } else if (registro.status === 'D') {
          await fetch(`${apiUrl}/${dominio}/${pkValue}`, fetchOpts('DELETE'));
          resultado.deletados++;
        }
      } finally {
        clearTimeout(timer);
      }

      // Marca como sincronizado com sucesso
      this.drizzle.db
        .update(tabela)
        .set({ status: 'S' } as any)
        .where(eq(pkField, pkValue))
        .run();

    } catch (err: any) {
      resultado.erros++;

      const mensagemErro = err.name === 'AbortError'
        ? `Timeout após ${API_TIMEOUT_MS}ms`
        : (err.message?.substring(0, 500) ?? 'Erro desconhecido');

      this.logger.error(
        `Falha sync ${dominio}[${pkValue}]: ${mensagemErro}`,
        'Sincronizacao',
      );

      this.drizzle.db
        .update(tabela)
        .set({ retorno: mensagemErro, status: 'E' } as any)
        .where(eq(pkField, pkValue))
        .run();
    }
  }

  private salvarHistorico(
    dominio:   string,
    resultado: ResultadoSync,
    duracaoMs: number,
  ): void {
    this.drizzle.db
      .insert(syncHistorico)
      .values({ dominio, resultado: JSON.stringify(resultado), duracaoMs })
      .run();
  }

  // ─── Resolvers ────────────────────────────────────────────────────────────

  private resolverTabela(dominio: string): any {
    const tabela = DOMINIO_TABELA[dominio];
    if (!tabela) {
      throw new BadRequestException(
        `Domínio desconhecido: "${dominio}". ` +
        `Válidos: ${Object.keys(DOMINIO_TABELA).join(', ')}`,
      );
    }
    return tabela;
  }

  /**
   * Retorna a coluna PK Drizzle para o domínio.
   * CORREÇÃO CRÍTICA: todos os domínios mapeados em DOMINIO_TABELA
   * têm entrada correspondente em DOMINIO_PK — nunca retorna undefined.
   */
  private resolverPk(dominio: string): any {
    const pk = DOMINIO_PK[dominio];
    if (!pk) {
      // Este caso não deve ocorrer se DOMINIO_TABELA e DOMINIO_PK estiverem sincronizados,
      // mas garantimos uma exceção clara em vez de TypeError silencioso.
      throw new BadRequestException(
        `Chave primária não mapeada para o domínio: "${dominio}". ` +
        `Verifique DOMINIO_PK em sincronizacao.service.ts`,
      );
    }
    return pk;
  }

  private validarDominio(dominio: string): void {
    if (!DOMINIOS_VALIDOS.includes(dominio as any)) {
      throw new BadRequestException(
        `Domínio inválido: "${dominio}". Válidos: ${DOMINIOS_VALIDOS.join(', ')}`,
      );
    }
  }

  private validarApiConfig(cfg: ApiConfig): void {
    if (!cfg?.apiUrl) throw new BadRequestException('x-api-url é obrigatório');
    if (!cfg?.apiKey) throw new BadRequestException('x-api-key é obrigatório');
  }
}