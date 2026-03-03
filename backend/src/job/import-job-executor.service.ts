// backend/src/job/import-job-executor.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { CredencialService, CredencialVF } from '../importacao/credenciais/credencial.service';
import { VarejoFacilHttpService }           from '../importacao/varejo-facil/varejo-facil-http.service';
import { AppLoggerService }                 from '../logger/logger.service';
import { SqliteService }                    from '../database/sqlite.service';
import { ImportJobService }                 from './import-job.service';
import { MercadologiaRepository }           from '../importacao/repositories/mercadologia.repository';
import { ProdutoRepository }                from '../importacao/repositories/produto.repository';
import { FinanceiroRepository }             from '../importacao/repositories/financeiro.repository';
import { FrenteLojaRepository }             from '../importacao/repositories/frente-loja.repository';
import { EstoqueRepository }                from '../importacao/repositories/estoque.repository';
import { FiscalRepository }                 from '../importacao/repositories/fiscal.repository';
import { PessoaRepository }                 from '../importacao/repositories/pessoa.repository';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface StepDef {
  endpoint: string;
  save: (data: any[]) => any;
}

// ✅ CORREÇÃO: interface declarada FORA da classe — resolve erro TS2345
interface DominioDef {
  label:    string;
  steps:    { name: string; label: string }[];  // mutável, não readonly
  executor: (jobId: string) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class ImportJobExecutorService {

  constructor(
    private readonly jobService:   ImportJobService,
    private readonly credencial:   CredencialService,
    private readonly vf:           VarejoFacilHttpService,
    private readonly logger:       AppLoggerService,
    private readonly sqlite:       SqliteService,
    private readonly mercadologia: MercadologiaRepository,
    private readonly produto:      ProdutoRepository,
    private readonly financeiro:   FinanceiroRepository,
    private readonly frenteLoja:   FrenteLojaRepository,
    private readonly estoque:      EstoqueRepository,
    private readonly fiscal:       FiscalRepository,
    private readonly pessoa:       PessoaRepository,
  ) {}

  // ─── Mapa de domínios ─────────────────────────────────────────────────────
  // ✅ Tipado com Record<string, DominioDef> → steps é mutável → sem erro TS2345

  private readonly DOMINIOS: Record<string, DominioDef> = {

    produto: {
      label: 'Importar Tudo — Produto',
      steps: [
        { name: 'secoes',              label: 'Seções' },
        { name: 'grupos',              label: 'Grupos' },
        { name: 'subgrupos',           label: 'Subgrupos' },
        { name: 'marcas',              label: 'Marcas' },
        { name: 'familias',            label: 'Famílias' },
        { name: 'produtos',            label: 'Produtos' },
        { name: 'produtoAuxiliares',   label: 'Auxiliares' },
        { name: 'produtoFornecedores', label: 'Fornecedores Produto' },
      ],
      executor: (id) => this._executarProduto(id),
    },

    financeiro: {
      label: 'Importar Tudo — Financeiro',
      steps: [
        { name: 'categorias',        label: 'Categorias' },
        { name: 'agentes',           label: 'Agentes' },
        { name: 'contasCorrentes',   label: 'Contas Correntes' },
        { name: 'especiesDocumento', label: 'Espécies de Documento' },
        { name: 'historicoPadrao',   label: 'Histórico Padrão' },
        { name: 'formasPagamento',   label: 'Formas de Pagamento' },
      ],
      executor: (id) => this._executarFinanceiro(id),
    },

    frenteLoja: {
      label: 'Importar Tudo — Frente de Loja',
      steps: [
        { name: 'pagamentosPDV',       label: 'Pagamentos PDV' },
        { name: 'recebimentosPDV',     label: 'Recebimentos PDV' },
        { name: 'motivosDesconto',     label: 'Motivos de Desconto' },
        { name: 'motivosDevolucao',    label: 'Motivos de Devolução' },
        { name: 'motivosCancelamento', label: 'Motivos de Cancelamento' },
        { name: 'perguntasRespostas',  label: 'Perguntas e Respostas' },
      ],
      executor: (id) => this._executarPdv(id),
    },

    // alias aceito do frontend (button-manager usa 'pdv' como domínio em alguns casos)
    pdv: {
      label: 'Importar Tudo — Frente de Loja',
      steps: [
        { name: 'pagamentosPDV',       label: 'Pagamentos PDV' },
        { name: 'recebimentosPDV',     label: 'Recebimentos PDV' },
        { name: 'motivosDesconto',     label: 'Motivos de Desconto' },
        { name: 'motivosDevolucao',    label: 'Motivos de Devolução' },
        { name: 'motivosCancelamento', label: 'Motivos de Cancelamento' },
        { name: 'perguntasRespostas',  label: 'Perguntas e Respostas' },
      ],
      executor: (id) => this._executarPdv(id),
    },

    estoque: {
      label: 'Importar Tudo — Estoque',
      steps: [
        { name: 'localEstoque', label: 'Locais de Estoque' },
        { name: 'tiposAjustes', label: 'Tipos de Ajustes' },
        { name: 'saldoEstoque', label: 'Saldo de Estoque' },
      ],
      executor: (id) => this._executarEstoque(id),
    },

    fiscal: {
      label: 'Importar Tudo — Fiscal',
      steps: [
        { name: 'regimeTributario',   label: 'Regime Tributário' },
        { name: 'situacoesFiscais',   label: 'Situações Fiscais' },
        { name: 'tiposOperacoes',     label: 'Tipos de Operações' },
        { name: 'impostosFederais',   label: 'Impostos Federais' },
        { name: 'tabelasTributarias', label: 'Tabelas Tributárias' },
        { name: 'cenariosFiscais',    label: 'Cenários Fiscais' },
      ],
      executor: (id) => this._executarFiscal(id),
    },

    pessoa: {
      label: 'Importar Tudo — Pessoa',
      steps: [
        { name: 'lojas',        label: 'Lojas' },
        { name: 'clientes',     label: 'Clientes' },
        { name: 'fornecedores', label: 'Fornecedores' },
      ],
      executor: (id) => this._executarPessoa(id),
    },
  };

  // ─── Mapa global de steps individuais ────────────────────────────────────
  // ✅ SEM ?lojaId= em nenhum endpoint → traz dados de TODAS as lojas
  // ✅ Inclui aliases para nomes alternativos vindos do frontend

  private get STEP_MAP(): Record<string, StepDef> {
    return {

      // ── PRODUTO ──────────────────────────────────────────────────────────
      secoes:              { endpoint: 'produto/secoes',             save: d => this.mercadologia.importarSecoes(d) },
      grupos:              { endpoint: 'produto/grupos',             save: d => this.mercadologia.importarGrupos(d) },
      subgrupos:           { endpoint: 'produto/subgrupos',          save: d => this.mercadologia.importarSubgrupos(d) },
      // alias: 'mercadologia' vem do card do frontend → roda seções como representante
      mercadologia:        { endpoint: 'produto/secoes',             save: d => this.mercadologia.importarSecoes(d) },
      marcas:              { endpoint: 'produto/marcas',             save: d => this.produto.importarMarcas(d) },
      familias:            { endpoint: 'produto/familias',           save: d => this.produto.importarFamilias(d) },
      // sem ?lojaId= → todas as lojas
      produtos:            { endpoint: 'produto/produtos',           save: d => this.produto.importarProdutos(d) },
      produtoAuxiliares:   { endpoint: 'produto/produto-auxiliares', save: d => this.produto.importarProdutoAuxiliares(d) },

      // ── FINANCEIRO ───────────────────────────────────────────────────────
      categorias:          { endpoint: 'financeiro/categorias',         save: d => this.financeiro.importarCategorias(d) },
      agentes:             { endpoint: 'financeiro/agentes',            save: d => this.financeiro.importarAgentes(d) },
      contasCorrentes:     { endpoint: 'financeiro/contas-correntes',   save: d => this.financeiro.importarContasCorrentes(d) },
      especiesDocumento:   { endpoint: 'financeiro/especies-documento', save: d => this.financeiro.importarEspeciesDocumento(d) },
      historicoPadrao:     { endpoint: 'financeiro/historico-padrao',   save: d => this.financeiro.importarHistoricoPadrao(d) },

      // ── PDV / FRENTE DE LOJA ─────────────────────────────────────────────
      pagamentosPDV:       { endpoint: 'pdv/pagamentos',           save: d => this.frenteLoja.importarPagamentosPDV(d) },
      recebimentosPDV:     { endpoint: 'pdv/recebimentos',         save: d => this.frenteLoja.importarRecebimentosPDV(d) },
      motivosDesconto:     { endpoint: 'pdv/motivos-desconto',     save: d => this.frenteLoja.importarMotivosDesconto(d) },
      motivosDevolucao:    { endpoint: 'pdv/motivos-devolucao',    save: d => this.frenteLoja.importarMotivosDevolucao(d) },
      motivosCancelamento: { endpoint: 'pdv/motivos-cancelamento', save: d => this.frenteLoja.importarMotivosCancelamento(d) },
      formaPagamentoPDV:   { endpoint: 'pdv/pagamentos',           save: d => this.frenteLoja.importarPagamentosPDV(d) },
      motivoCancelamento:  { endpoint: 'pdv/motivos-cancelamento', save: d => this.frenteLoja.importarMotivosCancelamento(d) },

      // ── ESTOQUE ──────────────────────────────────────────────────────────
      localEstoque:        { endpoint: 'estoque/locais',        save: d => this.estoque.importarLocalEstoque(d) },
      tiposAjustes:        { endpoint: 'estoque/tipos-ajustes', save: d => this.estoque.importarTiposAjustes(d) },
      saldoEstoque:        { endpoint: 'estoque/saldo',         save: d => this.estoque.importarSaldoEstoque(d) },

      // ── FISCAL ───────────────────────────────────────────────────────────
      regimeTributario:    { endpoint: 'fiscal/regime-tributario',   save: d => this.fiscal.importarRegimeTributario(d) },
      situacoesFiscais:    { endpoint: 'fiscal/situacoes-fiscais',   save: d => this.fiscal.importarSituacoesFiscais(d) },
      tiposOperacoes:      { endpoint: 'fiscal/tipos-operacoes',     save: d => this.fiscal.importarTiposOperacoes(d) },
      impostosFederais:    { endpoint: 'fiscal/impostos-federais',   save: d => this.fiscal.importarImpostosFederais(d) },
      tabelasTributarias:  { endpoint: 'fiscal/tabelas-tributarias', save: d => this.fiscal.importarTabelasTributarias(d) },
      cenariosFiscais:     { endpoint: 'fiscal/cenarios-fiscais',    save: d => this.fiscal.importarCenariosFiscais(d) },

      // ── PESSOA ───────────────────────────────────────────────────────────
      lojas:               { endpoint: 'pessoa/lojas',        save: d => this.pessoa.importarLojas(d) },
      clientes:            { endpoint: 'pessoa/clientes',     save: d => this.pessoa.importarClientes(d) },
      fornecedores:        { endpoint: 'pessoa/fornecedores', save: d => this.pessoa.importarFornecedores(d) },
    };
  }

  // ─── API Pública ──────────────────────────────────────────────────────────

  listarDominios() {
    return Object.entries(this.DOMINIOS).map(([key, def]) => ({
      dominio: key,
      label:   def.label,
      steps:   def.steps.length,
    }));
  }

  /**
   * Inicia um job de importação.
   * @param dominio - Identificador do domínio
   * @param step    - (opcional) Nome da etapa individual. Omitido = domínio completo.
   */
  async iniciar(dominio: string, step?: string): Promise<string> {

    if (!this.credencial.estaConfigurado()) {
      throw new BadRequestException(
        'Credenciais não configuradas. Acesse Configurações e salve as credenciais primeiro.',
      );
    }

    // ── Etapa individual ──────────────────────────────────────────────────────
    if (step) {
      const stepDef = this.STEP_MAP[step];
      if (!stepDef) {
        throw new BadRequestException(
          `Step desconhecido: "${step}" no domínio "${dominio}". ` +
          `Verifique se o nome bate com as chaves do STEP_MAP.`,
        );
      }

      const label = this._stepLabel(step);
      const job   = this.jobService.createJob(
        dominio,
        `Importar — ${label}`,
        [{ name: step, label }],
      );

      this._runSingleStep(job.id, step, stepDef).catch(err => {
        this.logger.error(`Job step ${job.id} falhou: ${err.message}`, 'ImportJobExecutor');
        this.jobService.failJob(job.id, err.message);
      });

      this.logger.info(`Job step iniciado: ${job.id} (${dominio}/${step})`, 'ImportJobExecutor');
      return job.id;
    }

    // ── Domínio completo ──────────────────────────────────────────────────────
    const def = this.DOMINIOS[dominio];
    if (!def) {
      throw new BadRequestException(
        `Domínio inválido: "${dominio}". ` +
        `Válidos: ${Object.keys(this.DOMINIOS).join(', ')}`,
      );
    }

    const job = this.jobService.createJob(dominio, def.label, def.steps);

    def.executor(job.id).catch(err => {
      this.logger.error(`Job ${job.id} falhou: ${err.message}`, 'ImportJobExecutor');
      this.jobService.failJob(job.id, err.message);
    });

    this.logger.info(`Job iniciado: ${job.id} (${dominio})`, 'ImportJobExecutor');
    return job.id;
  }

  // ─── Executores de domínio completo ──────────────────────────────────────

  private async _executarProduto(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'secoes',            cred, this.STEP_MAP['secoes']);
    await this._step(jobId, 'grupos',            cred, this.STEP_MAP['grupos']);
    await this._step(jobId, 'subgrupos',         cred, this.STEP_MAP['subgrupos']);
    await this._step(jobId, 'marcas',            cred, this.STEP_MAP['marcas']);
    await this._step(jobId, 'familias',          cred, this.STEP_MAP['familias']);
    await this._step(jobId, 'produtos',          cred, this.STEP_MAP['produtos']);
    await this._step(jobId, 'produtoAuxiliares', cred, this.STEP_MAP['produtoAuxiliares']);
    await this._stepFornecedoresProduto(jobId, cred);

    this.jobService.completeJob(jobId);
  }

  private async _executarFinanceiro(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'categorias',        cred, this.STEP_MAP['categorias']);
    await this._step(jobId, 'agentes',           cred, this.STEP_MAP['agentes']);
    await this._step(jobId, 'contasCorrentes',   cred, this.STEP_MAP['contasCorrentes']);
    await this._step(jobId, 'especiesDocumento', cred, this.STEP_MAP['especiesDocumento']);
    await this._step(jobId, 'historicoPadrao',   cred, this.STEP_MAP['historicoPadrao']);
    await this._step(jobId, 'formasPagamento',   cred, this.STEP_MAP['formasPagamento']);

    this.jobService.completeJob(jobId);
  }

  private async _executarPdv(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'pagamentosPDV',       cred, this.STEP_MAP['pagamentosPDV']);
    await this._step(jobId, 'recebimentosPDV',     cred, this.STEP_MAP['recebimentosPDV']);
    await this._step(jobId, 'motivosDesconto',     cred, this.STEP_MAP['motivosDesconto']);
    await this._step(jobId, 'motivosDevolucao',    cred, this.STEP_MAP['motivosDevolucao']);
    await this._step(jobId, 'motivosCancelamento', cred, this.STEP_MAP['motivosCancelamento']);
    await this._step(jobId, 'perguntasRespostas',  cred, this.STEP_MAP['perguntasRespostas']);

    this.jobService.completeJob(jobId);
  }

  private async _executarEstoque(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'localEstoque', cred, this.STEP_MAP['localEstoque']);
    await this._step(jobId, 'tiposAjustes', cred, this.STEP_MAP['tiposAjustes']);
    await this._step(jobId, 'saldoEstoque', cred, this.STEP_MAP['saldoEstoque']);

    this.jobService.completeJob(jobId);
  }

  private async _executarFiscal(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'regimeTributario',   cred, this.STEP_MAP['regimeTributario']);
    await this._step(jobId, 'situacoesFiscais',   cred, this.STEP_MAP['situacoesFiscais']);
    await this._step(jobId, 'tiposOperacoes',     cred, this.STEP_MAP['tiposOperacoes']);
    await this._step(jobId, 'impostosFederais',   cred, this.STEP_MAP['impostosFederais']);
    await this._step(jobId, 'tabelasTributarias', cred, this.STEP_MAP['tabelasTributarias']);
    await this._step(jobId, 'cenariosFiscais',    cred, this.STEP_MAP['cenariosFiscais']);

    this.jobService.completeJob(jobId);
  }

  private async _executarPessoa(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'lojas',        cred, this.STEP_MAP['lojas']);
    await this._step(jobId, 'clientes',     cred, this.STEP_MAP['clientes']);
    await this._step(jobId, 'fornecedores', cred, this.STEP_MAP['fornecedores']);

    this.jobService.completeJob(jobId);
  }

  // ─── Helpers privados ────────────────────────────────────────────────────

  /** Cria job de 1 etapa, inicia e completa. */
  private async _runSingleStep(jobId: string, stepName: string, def: StepDef): Promise<void> {
    this.jobService.startJob(jobId);
    await this._step(jobId, stepName, this.credencial.carregar(), def);
    this.jobService.completeJob(jobId);
  }

  /** Busca paginada na API VF → salva no SQLite → emite progresso via SSE. */
  private async _step(
    jobId:    string,
    stepName: string,
    cred:     CredencialVF,
    def:      StepDef,
  ): Promise<void> {
    try {
      let processed = 0;

      await this.vf.fetchAll(cred, def.endpoint, async (items, _offset, total) => {
        await def.save(items);
        processed += items.length;
        this.jobService.updateStep(jobId, stepName, processed, total);
      });

      this.jobService.completeStep(jobId, stepName, processed);
      this.logger.info(`✅ Step: ${stepName} (${processed} registros)`, 'ImportJobExecutor');

    } catch (err: any) {
      this.jobService.failStep(jobId, stepName, err.message);
      this.logger.error(`❌ Step falhou: ${stepName} — ${err.message}`, 'ImportJobExecutor');
      throw err;
    }
  }

  /** Etapa especial: itera produtos do SQLite e busca fornecedores um a um. */
  private async _stepFornecedoresProduto(jobId: string, cred: CredencialVF): Promise<void> {
    const stepName = 'produtoFornecedores';
    try {
      const rows  = this.sqlite.query<{ produto_id: number }>(`SELECT produto_id FROM produtos`);
      const ids   = rows.map(r => r.produto_id);
      const total = ids.length;

      if (total === 0) {
        this.jobService.completeStep(jobId, stepName, 0);
        return;
      }

      let processed = 0;
      let totalSalvos = 0;

      for (const id of ids) {
        const fornecedores = await this.vf.fetchFornecedoresProduto(cred, id);
        if (fornecedores.length > 0) {
          await this.produto.importarProdutoFornecedores(fornecedores);
          totalSalvos += fornecedores.length;
        }
        processed++;
        this.jobService.updateStep(jobId, stepName, processed, total);
      }

      this.jobService.completeStep(jobId, stepName, totalSalvos);

    } catch (err: any) {
      this.jobService.failStep(jobId, stepName, err.message);
      throw err;
    }
  }

  /** Retorna label legível para exibição no job. */
  private _stepLabel(step: string): string {
    const labels: Record<string, string> = {
      secoes:              'Seções',
      grupos:              'Grupos',
      subgrupos:           'Subgrupos',
      mercadologia:        'Mercadologia',
      marcas:              'Marcas',
      familias:            'Famílias',
      produtos:            'Produtos',
      produtoAuxiliares:   'Auxiliares',
      produtoFornecedores: 'Fornec. Produto',
      categorias:          'Categorias',
      agentes:             'Agentes',
      contasCorrentes:     'Contas Correntes',
      especiesDocumento:   'Espécies Doc.',
      historicoPadrao:     'Histórico Padrão',
      formasPagamento:     'Formas de Pagamento',
      formaPagamentoPDV:   'Pag. PDV',
      pagamentosPDV:       'Pagamentos PDV',
      recebimentosPDV:     'Recebimentos PDV',
      motivosDesconto:     'Motivos Desconto',
      motivosDevolucao:    'Motivos Devolução',
      motivosCancelamento: 'Motivos Cancelamento',
      motivoCancelamento:  'Motivos Cancelamento',
      perguntasRespostas:  'Perguntas/Respostas',
      localEstoque:        'Local Estoque',
      tiposAjustes:        'Tipos Ajustes',
      saldoEstoque:        'Saldo Estoque',
      impostosFederais:    'Impostos Federais',
      regimeTributario:    'Regime Tributário',
      situacoesFiscais:    'Situações Fiscais',
      tiposOperacoes:      'Tipos Operações',
      tabelasTributarias:  'Tabelas Tributárias',
      cenariosFiscais:     'Cenários Fiscais',
      lojas:               'Lojas',
      clientes:            'Clientes',
      fornecedores:        'Fornecedores',
    };
    return labels[step] ?? step;
  }
}