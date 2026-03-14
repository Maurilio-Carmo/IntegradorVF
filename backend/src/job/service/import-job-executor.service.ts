// backend/src/job/import-job-executor.service.ts
// Responsabilidade única: mapas de domínio/step e dispatcher de execução.

import { Injectable, BadRequestException } from '@nestjs/common';
import { CredencialService }               from '../../importacao/service/credencial.service';
import { AppLoggerService }                from '../../logger/logger.service';
import { ImportJobService }                from './import-job.service';
import { JobStepRunnerService }            from './job-step-runner.service';
import { MercadologiaService }             from '../../importacao/service/mercadologia.service';
import { ProdutoService }                  from '../../importacao/service/produto.service';
import { FinanceiroService }               from '../../importacao/service/financeiro.service';
import { PdvService }                      from '../../importacao/service/frente-loja.service';
import { EstoqueService }                  from '../../importacao/service/estoque.service';
import { FiscalService }                   from '../../importacao/service/fiscal.service';
import { PessoaService }                   from '../../importacao/service/pessoa.service';
import { VarejoFacilHttpService }          from '../../importacao/service/varejo-facil-http.service';
import { DominioDef, StepDef }             from '../job.types';

@Injectable()
export class ImportJobExecutorService {

  constructor(
    private readonly jobService:   ImportJobService,
    private readonly credencial:   CredencialService,
    private readonly vf:           VarejoFacilHttpService,
    private readonly runner:       JobStepRunnerService,
    private readonly logger:       AppLoggerService,
    private readonly mercadologia: MercadologiaService,
    private readonly produto:      ProdutoService,
    private readonly financeiro:   FinanceiroService,
    private readonly frenteLoja:   PdvService,
    private readonly estoque:      EstoqueService,
    private readonly fiscal:       FiscalService,
    private readonly pessoa:       PessoaService,
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
    // Produto / Mercadológica
    secoes:              { endpoint: 'produto/secoes',             save: d => this.mercadologia.importarSecoes(d) },
    grupos:              { endpoint: 'produto/grupos',             save: d => this.mercadologia.importarGrupos(d) },
    subgrupos:           { endpoint: 'produto/subgrupos',          save: d => this.mercadologia.importarSubgrupos(d) },
    marcas:              { endpoint: 'produto/marcas',             save: d => this.produto.importarMarcas(d) },
    familias:            { endpoint: 'produto/familias',           save: d => this.produto.importarFamilias(d) },
    produtos:            { endpoint: 'produto/produtos',           save: d => this.produto.importarProdutos(d) },
    produtoAuxiliares:   { endpoint: 'produto/codigos-auxiliares', save: d => this.produto.importarProdutoAuxiliares(d) },
    produtoFornecedores: { endpoint: 'produto/fornecedores',       save: d => this.produto.importarProdutoFornecedores(d) },
    // Financeiro
    categorias:          { endpoint: 'financeiro/categorias',         save: d => this.financeiro.importarCategorias(d) },
    agentes:             { endpoint: 'pessoa/agentes-financeiros',     save: d => this.financeiro.importarAgentes(d) },
    contasCorrentes:     { endpoint: 'financeiro/contas-correntes',    save: d => this.financeiro.importarContasCorrentes(d) },
    especiesDocumento:   { endpoint: 'financeiro/especies-documentos', save: d => this.financeiro.importarEspeciesDocumento(d) },
    historicoPadrao:     { endpoint: 'financeiro/historicos-padrao',   save: d => this.financeiro.importarHistoricoPadrao(d) },
    formasPagamento:     { endpoint: 'financeiro/formas-pagamento',    save: d => this.financeiro.importarFormasPagamento(d) },
    // PDV / Frente de Loja
    pagamentosPDV:       { endpoint: 'pdv/pagamentos',               save: d => this.frenteLoja.importarPagamentosPDV(d) },
    recebimentosPDV:     { endpoint: 'pdv/recebimentos',             save: d => this.frenteLoja.importarRecebimentosPDV(d) },
    motivosDesconto:     { endpoint: 'motivos-desconto',             save: d => this.frenteLoja.importarMotivosDesconto(d) },
    motivosDevolucao:    { endpoint: 'financeiro/motivos-devolucao', save: d => this.frenteLoja.importarMotivosDevolucao(d) },
    motivosCancelamento: { endpoint: 'motivos-cancelamento',         save: d => this.frenteLoja.importarMotivosCancelamento(d) },
    // Estoque
    localEstoque:        { endpoint: 'estoque/locais',             save: d => this.estoque.importarLocalEstoque(d) },
    tiposAjustes:        { endpoint: 'estoque/tipos-ajustes',      save: d => this.estoque.importarTiposAjustes(d) },
    saldoEstoque:        { endpoint: 'estoque/saldos',             save: d => this.estoque.importarSaldoEstoque(d) },
    // Fiscal
    impostosFederais:    { endpoint: 'fiscal/impostos-federais',   save: d => this.fiscal.importarImpostosFederais(d) },
    regimeTributario:    { endpoint: 'fiscal/regimes-tributarios', save: d => this.fiscal.importarRegimeTributario(d) },
    situacoesFiscais:    { endpoint: 'fiscal/situacoes-fiscais',   save: d => this.fiscal.importarSituacoesFiscais(d) },
    tiposOperacoes:      { endpoint: 'fiscal/tipos-operacoes',     save: d => this.fiscal.importarTiposOperacoes(d) },
    tabelasTributarias:  { endpoint: 'fiscal/tabelas-tributarias', save: d => this.fiscal.importarTabelasTributarias(d) },
    cenariosFiscais:     { endpoint: 'fiscal/cenarios-fiscais',    save: d => this.fiscal.importarCenariosFiscais(d) },
    // Pessoa
    lojas:               { endpoint: 'pessoa/lojas',               save: d => this.pessoa.importarLojas(d) },
    clientes:            { endpoint: 'pessoa/clientes',            save: d => this.pessoa.importarClientes(d) },
    fornecedores:        { endpoint: 'pessoa/fornecedores',        save: d => this.pessoa.importarFornecedores(d) },
  };

  // ─── API Pública ──────────────────────────────────────────────────────────

  /**
   * Cria o job, dispara execução assíncrona e retorna o jobId imediatamente.
   */
  async iniciar(dominio: string, step?: string): Promise<string> {
    const def = this.DOMINIOS[dominio];
    if (!def) throw new BadRequestException(`Domínio desconhecido: ${dominio}`);

    const stepsDoJob = step ? def.steps.filter(s => s.name === step) : def.steps;

    if (step && stepsDoJob.length === 0) {
      throw new BadRequestException(`Step "${step}" não encontrado no domínio "${dominio}"`);
    }

    const label = step ? `${def.label} → ${step}` : def.label;
    const job   = this.jobService.createJob(dominio, label, stepsDoJob);

    this._executarJob(job.id, dominio, step).catch(err => {
      this.logger.error(`Job ${job.id} falhou: ${err.message}`, 'Executor');
    });

    return job.id;
  }

  // ─── Executores por domínio ───────────────────────────────────────────────

  private async _executarProduto(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);
    await this.runner.run(jobId, 'secoes',            cred, this.STEP_MAP['secoes']);
    await this.runner.run(jobId, 'grupos',            cred, this.STEP_MAP['grupos']);
    await this.runner.run(jobId, 'subgrupos',         cred, this.STEP_MAP['subgrupos']);
    await this.runner.run(jobId, 'marcas',            cred, this.STEP_MAP['marcas']);
    await this.runner.run(jobId, 'familias',          cred, this.STEP_MAP['familias']);
    await this.runner.run(jobId, 'produtos',          cred, this.STEP_MAP['produtos']);
    await this.runner.run(jobId, 'produtoAuxiliares', cred, this.STEP_MAP['produtoAuxiliares']);
    await this._stepFornecedoresProduto(jobId, cred);
    this.jobService.completeJob(jobId);
  }

  private async _executarFinanceiro(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);
    await this.runner.run(jobId, 'categorias',        cred, this.STEP_MAP['categorias']);
    await this.runner.run(jobId, 'agentes',           cred, this.STEP_MAP['agentes']);
    await this.runner.run(jobId, 'contasCorrentes',   cred, this.STEP_MAP['contasCorrentes']);
    await this.runner.run(jobId, 'especiesDocumento', cred, this.STEP_MAP['especiesDocumento']);
    await this.runner.run(jobId, 'historicoPadrao',   cred, this.STEP_MAP['historicoPadrao']);
    await this.runner.run(jobId, 'formasPagamento',   cred, this.STEP_MAP['formasPagamento']);
    this.jobService.completeJob(jobId);
  }

  private async _executarPdv(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);
    await this.runner.run(jobId, 'pagamentosPDV',       cred, this.STEP_MAP['pagamentosPDV']);
    await this.runner.run(jobId, 'recebimentosPDV',     cred, this.STEP_MAP['recebimentosPDV']);
    await this.runner.run(jobId, 'motivosDesconto',     cred, this.STEP_MAP['motivosDesconto']);
    await this.runner.run(jobId, 'motivosDevolucao',    cred, this.STEP_MAP['motivosDevolucao']);
    await this.runner.run(jobId, 'motivosCancelamento', cred, this.STEP_MAP['motivosCancelamento']);
    await this.runner.run(jobId, 'perguntasRespostas',  cred, this.STEP_MAP['perguntasRespostas']);
    this.jobService.completeJob(jobId);
  }

  private async _executarEstoque(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);
    await this.runner.run(jobId, 'localEstoque', cred, this.STEP_MAP['localEstoque']);
    await this.runner.run(jobId, 'tiposAjustes', cred, this.STEP_MAP['tiposAjustes']);
    await this.runner.run(jobId, 'saldoEstoque', cred, this.STEP_MAP['saldoEstoque']);
    this.jobService.completeJob(jobId);
  }

  private async _executarFiscal(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);
    await this.runner.run(jobId, 'impostosFederais',   cred, this.STEP_MAP['impostosFederais']);
    await this.runner.run(jobId, 'regimeTributario',   cred, this.STEP_MAP['regimeTributario']);
    await this.runner.run(jobId, 'situacoesFiscais',   cred, this.STEP_MAP['situacoesFiscais']);
    await this.runner.run(jobId, 'tiposOperacoes',     cred, this.STEP_MAP['tiposOperacoes']);
    await this.runner.run(jobId, 'tabelasTributarias', cred, this.STEP_MAP['tabelasTributarias']);
    await this.runner.run(jobId, 'cenariosFiscais',    cred, this.STEP_MAP['cenariosFiscais']);
    this.jobService.completeJob(jobId);
  }

  private async _executarPessoa(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);
    await this.runner.run(jobId, 'lojas',        cred, this.STEP_MAP['lojas']);
    await this.runner.run(jobId, 'clientes',     cred, this.STEP_MAP['clientes']);
    await this.runner.run(jobId, 'fornecedores', cred, this.STEP_MAP['fornecedores']);
    this.jobService.completeJob(jobId);
  }

  // ─── Step especial: fornecedores por produto ──────────────────────────────

  /**
   * A API exige uma requisição por produto — não usa fetchAll paginado.
   */
  private async _stepFornecedoresProduto(jobId: string, cred: any): Promise<void> {
    const stepName = 'produtoFornecedores';
    try {
      this.jobService.updateStep(jobId, stepName, 0, 0, 'running');

      const ids         = await this.produto.listarProdutoIds();
      const total       = ids.length;
      let   processados = 0;

      for (const produtoId of ids) {
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
      this.logger.info(`✅ ${stepName}: ${processados} produtos verificados`, 'Executor');

    } catch (err: any) {
      this.jobService.failStep(jobId, stepName, err.message);
      this.logger.error(`❌ ${stepName}: ${err.message}`, 'Executor');
      throw err;
    }
  }

  // ─── Dispatcher ──────────────────────────────────────────────────────────

  private async _executarJob(jobId: string, dominio: string, step?: string): Promise<void> {
    if (step) {
      const def = this.STEP_MAP[step];
      if (!def) throw new BadRequestException(`Step desconhecido: ${step}`);
      const cred = this.credencial.carregar();
      this.jobService.startJob(jobId);
      await this.runner.run(jobId, step, cred, def);
      this.jobService.completeJob(jobId);
      return;
    }

    const dominioDef = this.DOMINIOS[dominio];
    if (!dominioDef) throw new BadRequestException(`Domínio desconhecido: ${dominio}`);
    await dominioDef.executor(jobId);
  }
}
