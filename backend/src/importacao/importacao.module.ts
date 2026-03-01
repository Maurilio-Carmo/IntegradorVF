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

// Repositories NestJS
import { MercadologiaRepository } from './repositories/mercadologia.repository';
import { ProdutoRepository }      from './repositories/produto.repository';
import { FinanceiroRepository }   from './repositories/financeiro.repository';
import { FrenteLojaRepository }   from './repositories/frente-loja.repository';
import { EstoqueRepository }      from './repositories/estoque.repository';
import { FiscalRepository }       from './repositories/fiscal.repository';
import { PessoaRepository }       from './repositories/pessoa.repository';

/**
 * Módulo de Importação — agrupa todos os sub-domínios:
 * produto, financeiro, fiscal, estoque, pdv, pessoa.
 *
 * Cada sub-módulo tem controller + service independentes.
 * Os repositories são @Injectable() e injetam SqliteService diretamente,
 * eliminando as bridges CJS (importacao-service.js + repositories/*.js).
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
    // Services (consomem os repositories abaixo)
    ProdutoService,
    FinanceiroService,
    FiscalService,
    EstoqueService,
    PdvService,
    PessoaService,

    // Repositories NestJS — porta direta dos CJS
    MercadologiaRepository,
    ProdutoRepository,
    FinanceiroRepository,
    FrenteLojaRepository,
    EstoqueRepository,
    FiscalRepository,
    PessoaRepository,
  ],
})
export class ImportacaoModule {}