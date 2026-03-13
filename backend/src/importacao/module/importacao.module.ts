// backend/src/importacao/importacao.module.ts

import { Module } from '@nestjs/common';

// Controllers
import { ImportacaoController }  from '../importacao.controller';
import { ProdutoController }     from '../controller/produto.controller';
import { FinanceiroController }  from './financeiro/financeiro.controller';
import { FiscalController }      from '../controller/fiscal.controller';
import { EstoqueController }     from '../controller/estoque.controller';
import { PdvController }         from '../controller/frente-loja.controller';
import { PessoaController }      from '../controller/pessoa.controller';

// Services
import { ProdutoService }    from '../service/produto.service';
import { FinanceiroService } from '../service/financeiro.service';
import { FiscalService }     from '../service/fiscal.service';
import { EstoqueService }    from '../service/estoque.service';
import { PdvService }        from '../service/frente-loja.service';
import { PessoaService }     from '../service/pessoa.service';

// Repositories — importados do barrel file (index.ts)
import {
  // Mercadologia
  SecoesRepository,
  GruposRepository,
  SubgruposRepository,
  // Produto
  MarcasRepository,
  FamiliasRepository,
  ProdutosRepository,
  ProdutoAuxiliaresRepository,
  ProdutoFornecedoresRepository,
  ProdutoMinMaxRepository,
  ProdutoRegimesRepository,
  ProdutoComponentesRepository,
  ProdutoImpostosFederaisRepository,
  // Financeiro
  CategoriasRepository,
  AgentesRepository,
  ContasCorrentesRepository,
  EspeciesDocumentosRepository,
  HistoricoPadraoRepository,
  // Frente de Loja
  FormasPagamentoRepository,
  PagamentosPdvRepository,
  RecebimentosPdvRepository,
  MotivoDescontoRepository,
  MotivosDevolucaoRepository,
  MotivosCancelamentoRepository,
  // Estoque
  LocalEstoqueRepository,
  TiposAjustesRepository,
  SaldoEstoqueRepository,
  // Fiscal
  RegimeTributarioRepository,
  SituacoesFiscaisRepository,
  TiposOperacoesRepository,
  ImpostosFederaisRepository,
  TabelasTributariasRepository,
  CenariosFiscaisRepository,
  // Pessoa
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
    ProdutoService,
    FinanceiroService,
    FiscalService,
    EstoqueService,
    PdvService,
    PessoaService,
    ...ALL_REPOSITORIES,
  ],
  exports: [
    // Exportados para ImportJobModule consumir via ImportacaoModule
    ...ALL_REPOSITORIES,
  ],
})
export class ImportacaoModule {}