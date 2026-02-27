// backend/src/importacao/importacao.module.ts
import { Module }               from '@nestjs/common';

// Controllers
import { ImportacaoController }  from './importacao.controller';
import { ProdutoController }     from './produto/produto.controller';
import { FinanceiroController }  from './financeiro/financeiro.controller';
import { FiscalController }      from './fiscal/fiscal.controller';
import { EstoqueController }     from './estoque/estoque.controller';
import { PdvController }         from './pdv/pdv.controller';
import { PessoaController }      from './pessoa/pessoa.controller';

// Services
import { ProdutoService }        from './produto/produto.service';
import { FinanceiroService }     from './financeiro/financeiro.service';
import { FiscalService }         from './fiscal/fiscal.service';
import { EstoqueService }        from './estoque/estoque.service';
import { PdvService }            from './pdv/pdv.service';
import { PessoaService }         from './pessoa/pessoa.service';

/**
 * Módulo de Importação — agrupa todos os sub-domínios:
 * produto, financeiro, fiscal, estoque, pdv, pessoa.
 * Cada sub-módulo tem controller + service independentes.
 */
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
  ],
})
export class ImportacaoModule {}
