// backend/src/job/import-job-executor.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { eq }                               from 'drizzle-orm';
import { CredencialService, CredencialVF }  from '../importacao/service/credencial.service';
import { VarejoFacilHttpService }            from '../importacao/varejo-facil/varejo-facil-http.service';
import { AppLoggerService }                  from '../logger/logger.service';
import { DrizzleService }                    from '../database/drizzle.service';
import { ImportJobService }                  from './import-job.service';
import { produtos }                          from '../database/schema';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface StepDef {
  endpoint: string;
  save:     (data: any[]) => Promise<any> | any;
}

interface DominioDef {
  label:    string;
  steps:    { name: string; label: string }[];
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
    private readonly drizzle:      DrizzleService,
    private readonly mercadologia: MercadologiaRepository,
    private readonly produto:      ProdutoRepository,
    private readonly financeiro:   FinanceiroRepository,
    private readonly frenteLoja:   FrenteLojaRepository,
    private readonly estoque:      EstoqueRepository,
    private readonly fiscal:       FiscalRepository,
    private readonly pessoa:       PessoaRepository,
  ) {}

  // ─── Mapa de domínios ─────────────────────────────────────────────────────

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

    pdv: {
      label: 'Importar Tudo — PDV',
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
        { name: 'tiposAjustes', label: 'Tipos de Ajuste' },
        { name: 'saldoEstoque', label: 'Saldo de Estoque' },
      ],
      executor: (id) => this._executarEstoque(id),
    },

    fiscal: {
      label: 'Importar Tudo — Fiscal',
      steps: [
        { name: 'impostosFederais',   label: 'Impostos Federais' },
        { name: 'regimeTributario',   label: 'Regime Tributário' },
        { name: 'situacoesFiscais',   label: 'Situações Fiscais' },
        { name: 'tiposOperacoes',     label: 'Tipos de Operações' },
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

  // ─── Mapa step → endpoint + save ──────────────────────────────────────────

  private readonly STEP_MAP: Record<string, StepDef> = {
    // ── PRODUTO ──────────────────────────────────────────────────────────────
    secoes:              { endpoint: 'produto/secoes',             save: d => this.mercadologia.importarSecoes(d) },
    grupos:              { endpoint: 'produto/grupos',             save: d => this.mercadologia.importarGrupos(d) },
    subgrupos:           { endpoint: 'produto/subgrupos',          save: d => this.mercadologia.importarSubgrupos(d) },
    marcas:              { endpoint: 'produto/marcas',             save: d => this.produto.importarMarcas(d) },
    familias:            { endpoint: 'produto/familias',           save: d => this.produto.importarFamilias(d) },
    produtos:            { endpoint: 'produto/produtos',           save: d => this.produto.importarProdutos(d) },
    produtoAuxiliares:   { endpoint: 'produto/codigos-auxiliares', save: d => this.produto.importarProdutoAuxiliares(d) },
    produtoFornecedores: { endpoint: 'produto/fornecedores',       save: d => this.produto.importarProdutoFornecedores(d) },

    // ── FINANCEIRO ────────────────────────────────────────────────────────────
    categorias:          { endpoint: 'financeiro/categorias',          save: d => this.financeiro.importarCategorias(d) },
    agentes:             { endpoint: 'pessoa/agentes-financeiros',     save: d => this.financeiro.importarAgentes(d) },
    contasCorrentes:     { endpoint: 'financeiro/contas-correntes',    save: d => this.financeiro.importarContasCorrentes(d) },
    especiesDocumento:   { endpoint: 'financeiro/especies-documentos', save: d => this.financeiro.importarEspeciesDocumento(d) },
    historicoPadrao:     { endpoint: 'financeiro/historicos-padrao',   save: d => this.financeiro.importarHistoricoPadrao(d) },
    formasPagamento:     { endpoint: 'financeiro/formas-pagamento',    save: d => this.financeiro.importarFormasPagamento(d) },

    // ── PDV / FRENTE DE LOJA ──────────────────────────────────────────────────
    pagamentosPDV:       { endpoint: 'pdv/pagamentos',               save: d => this.frenteLoja.importarPagamentosPDV(d) },
    recebimentosPDV:     { endpoint: 'pdv/recebimentos',             save: d => this.frenteLoja.importarRecebimentosPDV(d) },
    motivosDesconto:     { endpoint: 'motivos-desconto',             save: d => this.frenteLoja.importarMotivosDesconto(d) },
    motivosDevolucao:    { endpoint: 'financeiro/motivos-devolucao', save: d => this.frenteLoja.importarMotivosDevolucao(d) },
    motivosCancelamento: { endpoint: 'motivos-cancelamento',         save: d => this.frenteLoja.importarMotivosCancelamento(d) },
    perguntasRespostas:  { endpoint: 'pdv/perguntas-respostas',      save: d => this.frenteLoja.importarPerguntasRespostas?.(d) ?? Promise.resolve() },

    // ── ESTOQUE ───────────────────────────────────────────────────────────────
    localEstoque:        { endpoint: 'estoque/locais',               save: d => this.estoque.importarLocalEstoque(d) },
    tiposAjustes:        { endpoint: 'estoque/tipos-ajustes',        save: d => this.estoque.importarTiposAjustes(d) },
    saldoEstoque:        { endpoint: 'estoque/saldos',               save: d => this.estoque.importarSaldoEstoque(d) },

    // ── FISCAL ────────────────────────────────────────────────────────────────
    impostosFederais:    { endpoint: 'fiscal/impostos-federais',     save: d => this.fiscal.importarImpostosFederais(d) },
    regimeTributario:    { endpoint: 'fiscal/regimes-tributarios',   save: d => this.fiscal.importarRegimeTributario(d) },
    situacoesFiscais:    { endpoint: 'fiscal/situacoes-fiscais',     save: d => this.fiscal.importarSituacoesFiscais(d) },
    tiposOperacoes:      { endpoint: 'fiscal/tipos-operacoes',       save: d => this.fiscal.importarTiposOperacoes(d) },
    tabelasTributarias:  { endpoint: 'fiscal/tabelas-tributarias',   save: d => this.fiscal.importarTabelasTributarias(d) },
    cenariosFiscais:     { endpoint: 'fiscal/cenarios-fiscais',      save: d => this.fiscal.importarCenariosFiscais(d) },

    // ── PESSOA ────────────────────────────────────────────────────────────────
    lojas:               { endpoint: 'pessoa/lojas',                 save: d => this.pessoa.importarLojas(d) },
    clientes:            { endpoint: 'pessoa/clientes',              save: d => this.pessoa.importarClientes(d) },
    fornecedores:        { endpoint: 'pessoa/fornecedores',          save: d => this.pessoa.importarFornecedores(d) },
  };

  // ─── API Pública ──────────────────────────────────────────────────────────

  /**
   * Inicia um job de importação.
   *
   * @param dominio - Domínio completo (ex: 'produto') ou step individual (ex: 'marcas')
   * @param step    - Se fornecido, executa apenas esse step dentro do domínio
   */
  async iniciar(dominio: string, step?: string): Promise<string> {
    const def = this.DOMINIOS[dominio];
    if (!def) throw new BadRequestException(`Domínio desconhecido: ${dominio}`);

    const stepsDoJob = step
      ? def.steps.filter(s => s.name === step)
      : def.steps;

    if (step && stepsDoJob.length === 0) {
      throw new BadRequestException(`Step "${step}" não encontrado no domínio "${dominio}"`);
    }

    const label  = step ? `${def.label} → ${step}` : def.label;
    const jobId  = this.jobService.createJob(dominio, label, stepsDoJob);

    // Executa de forma assíncrona — não aguarda aqui
    this._executarJob(jobId, dominio, step).catch(err => {
      this.logger.error(`Job ${jobId} falhou: ${err.message}`, 'ImportJobExecutor');
    });

    return jobId;
  }

  // ─── Executores por domínio ───────────────────────────────────────────────

  private async _executarProduto(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'secoes',              cred, this.STEP_MAP['secoes']);
    await this._step(jobId, 'grupos',              cred, this.STEP_MAP['grupos']);
    await this._step(jobId, 'subgrupos',           cred, this.STEP_MAP['subgrupos']);
    await this._step(jobId, 'marcas',              cred, this.STEP_MAP['marcas']);
    await this._step(jobId, 'familias',            cred, this.STEP_MAP['familias']);
    await this._step(jobId, 'produtos',            cred, this.STEP_MAP['produtos']);
    await this._step(jobId, 'produtoAuxiliares',   cred, this.STEP_MAP['produtoAuxiliares']);
    await this._stepFornecedoresProduto(jobId,     cred);

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

    await this._step(jobId, 'impostosFederais',   cred, this.STEP_MAP['impostosFederais']);
    await this._step(jobId, 'regimeTributario',   cred, this.STEP_MAP['regimeTributario']);
    await this._step(jobId, 'situacoesFiscais',   cred, this.STEP_MAP['situacoesFiscais']);
    await this._step(jobId, 'tiposOperacoes',     cred, this.STEP_MAP['tiposOperacoes']);
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

  // ─── Step genérico ────────────────────────────────────────────────────────

  private async _step(
    jobId:    string,
    stepName: string,
    cred:     CredencialVF,
    def:      StepDef,
  ): Promise<void> {
    try {
      this.jobService.updateStep(jobId, stepName, 0, 0, 'running');

      let totalProcessado = 0;

      // CORREÇÃO: assinatura correta com callback onPage
      const totalFetched = await this.vf.fetchAll(
        cred,
        def.endpoint,
        async (items: any[], offset: number, total: number) => {
          // Persiste a página imediatamente
          await def.save(items);

          totalProcessado += items.length;

          // Reporta progresso real ao SSE — atualizado a cada página
          this.jobService.updateStep(jobId, stepName, totalProcessado, total);

          this.logger.info(
            `  ${stepName}: ${totalProcessado}/${total > 0 ? total : '?'} (página offset=${offset})`,
            'ImportJobExecutor',
          );
        },
        'id', // campo de ordenação padrão
      );

      this.jobService.completeStep(jobId, stepName, totalFetched);
      this.logger.log(
        `✅ Step completo: ${stepName} (${totalFetched} registros)`,
        'ImportJobExecutor',
      );

    } catch (err: any) {
      this.jobService.failStep(jobId, stepName, err.message);
      this.logger.error(
        `❌ Step falhou: ${stepName} — ${err.message}`,
        'ImportJobExecutor',
      );
      throw err;
    }
  }

  /**
   * Step especial: busca fornecedores por produto_id.
   * Mantido separado pois usa endpoint diferente por produto.
   */
  private async _stepFornecedoresProduto(
    jobId: string,
    cred:  CredencialVF,
  ): Promise<void> {
    const stepName = 'produtoFornecedores';

    try {
      this.jobService.updateStep(jobId, stepName, 0, 0, 'running');

      // Busca todos os produto_ids cadastrados no SQLite
      const todosProdutos = this.drizzle.db
        .select({ produtoId: produtos.produtoId })
        .from(produtos)
        .all();

      const total       = todosProdutos.length;
      let processados   = 0;

      for (const { produtoId } of todosProdutos) {
        const fornecedores = await this.vf.fetchFornecedoresProduto(cred, produtoId);

        if (fornecedores.length > 0) {
          await this.produto.importarProdutoFornecedores(
            fornecedores.map((f: any) => ({ ...f, produtoId })),
          );
        }

        processados++;
        this.jobService.updateStep(jobId, stepName, processados, total);
      }

      this.jobService.completeStep(jobId, stepName, processados);
      this.logger.log(
        `✅ Step completo: ${stepName} (${processados} produtos verificados)`,
        'ImportJobExecutor',
      );

    } catch (err: any) {
      this.jobService.failStep(jobId, stepName, err.message);
      this.logger.error(
        `❌ Step falhou: ${stepName} — ${err.message}`,
        'ImportJobExecutor',
      );
      throw err;
    }
  }

  // ─── Dispatcher interno ───────────────────────────────────────────────────

  /**
   * Dispatcher que roteia para o executor correto, com suporte a step individual.
   * Quando `step` é fornecido, executa apenas aquele step em vez do domínio completo.
   */
  private async _executarJob(
    jobId:   string,
    dominio: string,
    step?:   string,
  ): Promise<void> {
    if (step) {
      // Execução de step individual
      const def = this.STEP_MAP[step];
      if (!def) throw new BadRequestException(`Step desconhecido: ${step}`);

      const cred = this.credencial.carregar();
      this.jobService.startJob(jobId);
      await this._step(jobId, step, cred, def);
      this.jobService.completeJob(jobId);
      return;
    }

    // Execução do domínio completo
    const dominioDef = this.DOMINIOS[dominio];
    if (!dominioDef) throw new BadRequestException(`Domínio desconhecido: ${dominio}`);

    await dominioDef.executor(jobId);
  }
}