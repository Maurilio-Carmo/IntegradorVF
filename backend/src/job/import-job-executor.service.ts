// backend/src/job/import-job-executor.service.ts
import { Injectable }             from '@nestjs/common';
import { ImportJobService }       from './import-job.service';
import { CredencialService, CredencialVF } from '../importacao/credenciais/credencial.service';
import { VarejoFacilHttpService } from '../importacao/varejo-facil/varejo-facil-http.service';
import { AppLoggerService }       from '../logger/logger.service';
import { SqliteService }          from '../database/sqlite.service';

import { MercadologiaRepository } from '../importacao/repositories/mercadologia.repository';
import { ProdutoRepository }      from '../importacao/repositories/produto.repository';
import { FinanceiroRepository }   from '../importacao/repositories/financeiro.repository';
import { FrenteLojaRepository }   from '../importacao/repositories/frente-loja.repository';
import { EstoqueRepository }      from '../importacao/repositories/estoque.repository';
import { FiscalRepository }       from '../importacao/repositories/fiscal.repository';
import { PessoaRepository }       from '../importacao/repositories/pessoa.repository';

/**
 * ImportJobExecutorService
 *
 * Motor dos jobs de importação.
 * Lê credenciais da tabela `credenciais` via CredencialService,
 * busca dados da API VF via VarejoFacilHttpService e salva via Repositories.
 *
 * Fluxo:
 *   frontend → POST /api/import-job/start { dominio }
 *   → executor.iniciar() cria job e dispara execução assíncrona
 *   → backend busca API VF → salva SQLite → emite progresso via SSE
 *   → frontend acompanha via EventSource (sobrevive a reload de página)
 */
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

  private readonly DOMINIOS: Record<string, {
    label:    string;
    steps:    { name: string; label: string }[];
    executor: (jobId: string) => Promise<void>;
  }> = {
    produto: {
      label: 'Produto',
      steps: [
        { name: 'secoes',              label: 'Seções' },
        { name: 'grupos',              label: 'Grupos' },
        { name: 'subgrupos',           label: 'Subgrupos' },
        { name: 'marcas',              label: 'Marcas' },
        { name: 'familias',            label: 'Famílias' },
        { name: 'produtos',            label: 'Produtos' },
        { name: 'produtoAuxiliares',   label: 'Auxiliares' },
        { name: 'produtoFornecedores', label: 'Fornecedores' },
      ],
      executor: (id) => this._executarProduto(id),
    },
    financeiro: {
      label: 'Financeiro',
      steps: [
        { name: 'categorias',        label: 'Categorias' },
        { name: 'agentes',           label: 'Agentes' },
        { name: 'contasCorrentes',   label: 'Contas Correntes' },
        { name: 'especiesDocumento', label: 'Espécies de Documento' },
        { name: 'historicoPadrao',   label: 'Histórico Padrão' },
      ],
      executor: (id) => this._executarFinanceiro(id),
    },
    pdv: {
      label: 'PDV / Frente de Loja',
      steps: [
        { name: 'formasPagamento',     label: 'Formas de Pagamento' },
        { name: 'pagamentosPDV',       label: 'Pagamentos PDV' },
        { name: 'recebimentosPDV',     label: 'Recebimentos PDV' },
        { name: 'motivosDesconto',     label: 'Motivos de Desconto' },
        { name: 'motivosDevolucao',    label: 'Motivos de Devolução' },
        { name: 'motivosCancelamento', label: 'Motivos de Cancelamento' },
      ],
      executor: (id) => this._executarPdv(id),
    },
    estoque: {
      label: 'Estoque',
      steps: [
        { name: 'localEstoque', label: 'Locais de Estoque' },
        { name: 'tiposAjustes', label: 'Tipos de Ajustes' },
        { name: 'saldoEstoque', label: 'Saldo de Estoque' },
      ],
      executor: (id) => this._executarEstoque(id),
    },
    fiscal: {
      label: 'Fiscal',
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
      label: 'Pessoa',
      steps: [
        { name: 'lojas',        label: 'Lojas' },
        { name: 'clientes',     label: 'Clientes' },
        { name: 'fornecedores', label: 'Fornecedores' },
      ],
      executor: (id) => this._executarPessoa(id),
    },
    tudo: {
      label: 'Importação Completa',
      steps: [
        { name: 'secoes',              label: 'Seções' },
        { name: 'grupos',              label: 'Grupos' },
        { name: 'subgrupos',           label: 'Subgrupos' },
        { name: 'marcas',              label: 'Marcas' },
        { name: 'familias',            label: 'Famílias' },
        { name: 'produtos',            label: 'Produtos' },
        { name: 'produtoAuxiliares',   label: 'Auxiliares de Produto' },
        { name: 'produtoFornecedores', label: 'Fornecedores de Produto' },
        { name: 'categorias',          label: 'Categorias' },
        { name: 'agentes',             label: 'Agentes' },
        { name: 'contasCorrentes',     label: 'Contas Correntes' },
        { name: 'especiesDocumento',   label: 'Espécies de Documento' },
        { name: 'historicoPadrao',     label: 'Histórico Padrão' },
        { name: 'formasPagamento',     label: 'Formas de Pagamento' },
        { name: 'pagamentosPDV',       label: 'Pagamentos PDV' },
        { name: 'recebimentosPDV',     label: 'Recebimentos PDV' },
        { name: 'motivosDesconto',     label: 'Motivos de Desconto' },
        { name: 'motivosDevolucao',    label: 'Motivos de Devolução' },
        { name: 'motivosCancelamento', label: 'Motivos de Cancelamento' },
        { name: 'localEstoque',        label: 'Locais de Estoque' },
        { name: 'tiposAjustes',        label: 'Tipos de Ajustes' },
        { name: 'saldoEstoque',        label: 'Saldo de Estoque' },
        { name: 'regimeTributario',    label: 'Regime Tributário' },
        { name: 'situacoesFiscais',    label: 'Situações Fiscais' },
        { name: 'tiposOperacoes',      label: 'Tipos de Operações' },
        { name: 'impostosFederais',    label: 'Impostos Federais' },
        { name: 'tabelasTributarias',  label: 'Tabelas Tributárias' },
        { name: 'cenariosFiscais',     label: 'Cenários Fiscais' },
        { name: 'lojas',               label: 'Lojas' },
        { name: 'clientes',            label: 'Clientes' },
        { name: 'fornecedores',        label: 'Fornecedores' },
      ],
      executor: (id) => this._executarTudo(id),
    },
  };

  // ─── API Pública ──────────────────────────────────────────────────────────

  listarDominios() {
    return Object.entries(this.DOMINIOS).map(([key, def]) => ({
      dominio: key,
      label:   def.label,
      steps:   def.steps.length,
    }));
  }

  async iniciar(dominio: string): Promise<string> {
    const def = this.DOMINIOS[dominio];
    if (!def) throw new Error(`Domínio inválido: "${dominio}"`);

    if (!this.credencial.estaConfigurado()) {
      throw new Error(
        'Credenciais da API Varejo Fácil não configuradas. ' +
        'Acesse Configurações e salve as credenciais primeiro.',
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

  // ─── Executores por domínio ───────────────────────────────────────────────

  private async _executarProduto(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'secoes',            'produto/secoes',             cred, d => this.mercadologia.importarSecoes(d));
    await this._step(jobId, 'grupos',            'produto/grupos',             cred, d => this.mercadologia.importarGrupos(d));
    await this._step(jobId, 'subgrupos',         'produto/subgrupos',          cred, d => this.mercadologia.importarSubgrupos(d));
    await this._step(jobId, 'marcas',            'produto/marcas',             cred, d => this.produto.importarMarcas(d));
    await this._step(jobId, 'familias',          'produto/familias',           cred, d => this.produto.importarFamilias(d));
    await this._step(jobId, 'produtos',          `produto/produtos?lojaId=${cred.lojaId}`, cred, d => this.produto.importarProdutos(d));
    await this._step(jobId, 'produtoAuxiliares', 'produto/produto-auxiliares', cred, d => this.produto.importarProdutoAuxiliares(d));
    await this._stepFornecedoresProduto(jobId, cred);

    this.jobService.completeJob(jobId);
  }

  private async _executarFinanceiro(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'categorias',        'financeiro/categorias',         cred, d => this.financeiro.importarCategorias(d));
    await this._step(jobId, 'agentes',           'financeiro/agentes',            cred, d => this.financeiro.importarAgentes(d));
    await this._step(jobId, 'contasCorrentes',   'financeiro/contas-correntes',   cred, d => this.financeiro.importarContasCorrentes(d));
    await this._step(jobId, 'especiesDocumento', 'financeiro/especies-documento', cred, d => this.financeiro.importarEspeciesDocumento(d));
    await this._step(jobId, 'historicoPadrao',   'financeiro/historico-padrao',   cred, d => this.financeiro.importarHistoricoPadrao(d));

    this.jobService.completeJob(jobId);
  }

  private async _executarPdv(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'formasPagamento',     'pdv/formas-pagamento',     cred, d => this.frenteLoja.importarFormasPagamento(d));
    await this._step(jobId, 'pagamentosPDV',       'pdv/pagamentos',           cred, d => this.frenteLoja.importarPagamentosPDV(d));
    await this._step(jobId, 'recebimentosPDV',     'pdv/recebimentos',         cred, d => this.frenteLoja.importarRecebimentosPDV(d));
    await this._step(jobId, 'motivosDesconto',     'pdv/motivos-desconto',     cred, d => this.frenteLoja.importarMotivosDesconto(d));
    await this._step(jobId, 'motivosDevolucao',    'pdv/motivos-devolucao',    cred, d => this.frenteLoja.importarMotivosDevolucao(d));
    await this._step(jobId, 'motivosCancelamento', 'pdv/motivos-cancelamento', cred, d => this.frenteLoja.importarMotivosCancelamento(d));

    this.jobService.completeJob(jobId);
  }

  private async _executarEstoque(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'localEstoque', 'estoque/locais',        cred, d => this.estoque.importarLocalEstoque(d));
    await this._step(jobId, 'tiposAjustes', 'estoque/tipos-ajustes', cred, d => this.estoque.importarTiposAjustes(d));
    await this._step(jobId, 'saldoEstoque', 'estoque/saldo',         cred, d => this.estoque.importarSaldoEstoque(d));

    this.jobService.completeJob(jobId);
  }

  private async _executarFiscal(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'regimeTributario',   'fiscal/regime-tributario',   cred, d => this.fiscal.importarRegimeTributario(d));
    await this._step(jobId, 'situacoesFiscais',   'fiscal/situacoes-fiscais',   cred, d => this.fiscal.importarSituacoesFiscais(d));
    await this._step(jobId, 'tiposOperacoes',     'fiscal/tipos-operacoes',     cred, d => this.fiscal.importarTiposOperacoes(d));
    await this._step(jobId, 'impostosFederais',   'fiscal/impostos-federais',   cred, d => this.fiscal.importarImpostosFederais(d));
    await this._step(jobId, 'tabelasTributarias', 'fiscal/tabelas-tributarias', cred, d => this.fiscal.importarTabelasTributarias(d));
    await this._step(jobId, 'cenariosFiscais',    'fiscal/cenarios-fiscais',    cred, d => this.fiscal.importarCenariosFiscais(d));

    this.jobService.completeJob(jobId);
  }

  private async _executarPessoa(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    await this._step(jobId, 'lojas',        'pessoa/lojas',        cred, d => this.pessoa.importarLojas(d));
    await this._step(jobId, 'clientes',     'pessoa/clientes',     cred, d => this.pessoa.importarClientes(d));
    await this._step(jobId, 'fornecedores', 'pessoa/fornecedores', cred, d => this.pessoa.importarFornecedores(d));

    this.jobService.completeJob(jobId);
  }

  private async _executarTudo(jobId: string): Promise<void> {
    const cred = this.credencial.carregar();
    this.jobService.startJob(jobId);

    // Produto
    await this._step(jobId, 'secoes',              'produto/secoes',              cred, d => this.mercadologia.importarSecoes(d));
    await this._step(jobId, 'grupos',              'produto/grupos',              cred, d => this.mercadologia.importarGrupos(d));
    await this._step(jobId, 'subgrupos',           'produto/subgrupos',           cred, d => this.mercadologia.importarSubgrupos(d));
    await this._step(jobId, 'marcas',              'produto/marcas',              cred, d => this.produto.importarMarcas(d));
    await this._step(jobId, 'familias',            'produto/familias',            cred, d => this.produto.importarFamilias(d));
    await this._step(jobId, 'produtos',            `produto/produtos?lojaId=${cred.lojaId}`, cred, d => this.produto.importarProdutos(d));
    await this._step(jobId, 'produtoAuxiliares',   'produto/produto-auxiliares',  cred, d => this.produto.importarProdutoAuxiliares(d));
    await this._stepFornecedoresProduto(jobId, cred);
    // Financeiro
    await this._step(jobId, 'categorias',          'financeiro/categorias',         cred, d => this.financeiro.importarCategorias(d));
    await this._step(jobId, 'agentes',             'financeiro/agentes',            cred, d => this.financeiro.importarAgentes(d));
    await this._step(jobId, 'contasCorrentes',     'financeiro/contas-correntes',   cred, d => this.financeiro.importarContasCorrentes(d));
    await this._step(jobId, 'especiesDocumento',   'financeiro/especies-documento', cred, d => this.financeiro.importarEspeciesDocumento(d));
    await this._step(jobId, 'historicoPadrao',     'financeiro/historico-padrao',   cred, d => this.financeiro.importarHistoricoPadrao(d));
    // PDV
    await this._step(jobId, 'formasPagamento',     'pdv/formas-pagamento',     cred, d => this.frenteLoja.importarFormasPagamento(d));
    await this._step(jobId, 'pagamentosPDV',       'pdv/pagamentos',           cred, d => this.frenteLoja.importarPagamentosPDV(d));
    await this._step(jobId, 'recebimentosPDV',     'pdv/recebimentos',         cred, d => this.frenteLoja.importarRecebimentosPDV(d));
    await this._step(jobId, 'motivosDesconto',     'pdv/motivos-desconto',     cred, d => this.frenteLoja.importarMotivosDesconto(d));
    await this._step(jobId, 'motivosDevolucao',    'pdv/motivos-devolucao',    cred, d => this.frenteLoja.importarMotivosDevolucao(d));
    await this._step(jobId, 'motivosCancelamento', 'pdv/motivos-cancelamento', cred, d => this.frenteLoja.importarMotivosCancelamento(d));
    // Estoque
    await this._step(jobId, 'localEstoque', 'estoque/locais',        cred, d => this.estoque.importarLocalEstoque(d));
    await this._step(jobId, 'tiposAjustes', 'estoque/tipos-ajustes', cred, d => this.estoque.importarTiposAjustes(d));
    await this._step(jobId, 'saldoEstoque', 'estoque/saldo',         cred, d => this.estoque.importarSaldoEstoque(d));
    // Fiscal
    await this._step(jobId, 'regimeTributario',   'fiscal/regime-tributario',   cred, d => this.fiscal.importarRegimeTributario(d));
    await this._step(jobId, 'situacoesFiscais',   'fiscal/situacoes-fiscais',   cred, d => this.fiscal.importarSituacoesFiscais(d));
    await this._step(jobId, 'tiposOperacoes',     'fiscal/tipos-operacoes',     cred, d => this.fiscal.importarTiposOperacoes(d));
    await this._step(jobId, 'impostosFederais',   'fiscal/impostos-federais',   cred, d => this.fiscal.importarImpostosFederais(d));
    await this._step(jobId, 'tabelasTributarias', 'fiscal/tabelas-tributarias', cred, d => this.fiscal.importarTabelasTributarias(d));
    await this._step(jobId, 'cenariosFiscais',    'fiscal/cenarios-fiscais',    cred, d => this.fiscal.importarCenariosFiscais(d));
    // Pessoa
    await this._step(jobId, 'lojas',        'pessoa/lojas',        cred, d => this.pessoa.importarLojas(d));
    await this._step(jobId, 'clientes',     'pessoa/clientes',     cred, d => this.pessoa.importarClientes(d));
    await this._step(jobId, 'fornecedores', 'pessoa/fornecedores', cred, d => this.pessoa.importarFornecedores(d));

    this.jobService.completeJob(jobId);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async _step(
    jobId:    string,
    stepName: string,
    endpoint: string,
    cred:     CredencialVF,
    save:     (data: any[]) => any,
  ): Promise<void> {
    try {
      let processed = 0;

      await this.vf.fetchAll(cred, endpoint, async (items, _offset, total) => {
        await save(items);
        processed += items.length;
        this.jobService.updateStep(jobId, stepName, processed, total);
      });

      this.jobService.completeStep(jobId, stepName, processed);
      this.logger.info(`Step concluído: ${stepName} (${processed})`, 'ImportJobExecutor');

    } catch (err: any) {
      this.jobService.failStep(jobId, stepName, err.message);
      this.logger.error(`Step falhou: ${stepName} — ${err.message}`, 'ImportJobExecutor');
      throw err;
    }
  }

  private async _stepFornecedoresProduto(
    jobId: string,
    cred:  CredencialVF,
  ): Promise<void> {
    const stepName = 'produtoFornecedores';
    try {
      const rows  = this.sqlite.query<{ produto_id: number }>(`SELECT produto_id FROM produtos`);
      const ids   = rows.map(r => r.produto_id);
      const total = ids.length;

      if (total === 0) {
        this.jobService.completeStep(jobId, stepName, 0);
        return;
      }

      let processed   = 0;
      let totalSalvos = 0;

      for (const id of ids) {
        const fornecedores = await this.vf.fetchFornecedoresProduto(cred, id);
        if (fornecedores.length > 0) {
          this.produto.importarProdutoFornecedores(fornecedores);
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
}
