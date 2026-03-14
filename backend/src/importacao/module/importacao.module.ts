// backend/src/importacao/module/importacao.module.ts

import { Module } from '@nestjs/common';

// Controllers
import { ImportacaoController } from '../controller/importacao.controller';
import { ProdutoController }    from '../controller/produto.controller';
import { FinanceiroController } from '../controller/financeiro.controller';
import { FiscalController }     from '../controller/fiscal.controller';
import { EstoqueController }    from '../controller/estoque.controller';
import { PdvController }        from '../controller/frente-loja.controller';
import { PessoaController }     from '../controller/pessoa.controller';

// Services
import { MercadologiaService } from '../service/mercadologia.service';
import { ProdutoService }      from '../service/produto.service';
import { FinanceiroService }   from '../service/financeiro.service';
import { FiscalService }       from '../service/fiscal.service';
import { EstoqueService }      from '../service/estoque.service';
import { PdvService }          from '../service/frente-loja.service';
import { PessoaService }       from '../service/pessoa.service';

// Repositories
import {
  SecoesRepository,
  GruposRepository,
  SubgruposRepository,
  MarcasRepository,
  FamiliasRepository,
  ProdutosRepository,
  ProdutoAuxiliaresRepository,
  ProdutoFornecedoresRepository,
  ProdutoMinMaxRepository,
  ProdutoRegimesRepository,
  ProdutoComponentesRepository,
  ProdutoImpostosFederaisRepository,
  CategoriasRepository,
  AgentesRepository,
  ContasCorrentesRepository,
  EspeciesDocumentosRepository,
  HistoricoPadraoRepository,
  FormasPagamentoRepository,
  PagamentosPdvRepository,
  RecebimentosPdvRepository,
  MotivoDescontoRepository,
  MotivosDevolucaoRepository,
  MotivosCancelamentoRepository,
  LocalEstoqueRepository,
  TiposAjustesRepository,
  SaldoEstoqueRepository,
  RegimeTributarioRepository,
  SituacoesFiscaisRepository,
  TiposOperacoesRepository,
  ImpostosFederaisRepository,
  TabelasTributariasRepository,
  CenariosFiscaisRepository,
  LojasRepository,
  ClientesRepository,
  FornecedoresRepository,
} from '../repositories';

const ALL_REPOSITORIES = [
  SecoesRepository,
  GruposRepository,
  SubgruposRepository,
  MarcasRepository,
  FamiliasRepository,
  ProdutosRepository,
  ProdutoAuxiliaresRepository,
  ProdutoFornecedoresRepository,
  ProdutoMinMaxRepository,
  ProdutoRegimesRepository,
  ProdutoComponentesRepository,
  ProdutoImpostosFederaisRepository,
  CategoriasRepository,
  AgentesRepository,
  ContasCorrentesRepository,
  EspeciesDocumentosRepository,
  HistoricoPadraoRepository,
  FormasPagamentoRepository,
  PagamentosPdvRepository,
  RecebimentosPdvRepository,
  MotivoDescontoRepository,
  MotivosDevolucaoRepository,
  MotivosCancelamentoRepository,
  LocalEstoqueRepository,
  TiposAjustesRepository,
  SaldoEstoqueRepository,
  RegimeTributarioRepository,
  SituacoesFiscaisRepository,
  TiposOperacoesRepository,
  ImpostosFederaisRepository,
  TabelasTributariasRepository,
  CenariosFiscaisRepository,
  LojasRepository,
  ClientesRepository,
  FornecedoresRepository,
];

const ALL_SERVICES = [
  MercadologiaService,
  ProdutoService,
  FinanceiroService,
  FiscalService,
  EstoqueService,
  PdvService,
  PessoaService,
];

@Module({
  controllers: [
    ImportacaoController,
    ProdutoController,
    FinanceiroController,
    FiscalController,
    EstoqueController,
    PdvController,
    PessoaController,
  ],
  providers: [
    ...ALL_SERVICES,
    ...ALL_REPOSITORIES,
  ],
  exports: [
    // Exportados para o ImportJobModule consumir via injeção de dependência
    ...ALL_SERVICES,
    ...ALL_REPOSITORIES,
  ],
})
export class ImportacaoModule {}