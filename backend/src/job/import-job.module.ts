// backend/src/job/import-job.module.ts
import { Module }                   from '@nestjs/common';
import { ImportJobController }      from './import-job.controller';
import { ImportJobService }         from './import-job.service';
import { ImportJobExecutorService } from './import-job-executor.service';

import { MercadologiaRepository }  from '../importacao/repositories/mercadologia.repository';
import { ProdutoRepository }       from '../importacao/repositories/produto.repository';
import { FinanceiroRepository }    from '../importacao/repositories/financeiro.repository';
import { FrenteLojaRepository }    from '../importacao/repositories/frente-loja.repository';
import { EstoqueRepository }       from '../importacao/repositories/estoque.repository';
import { FiscalRepository }        from '../importacao/repositories/fiscal.repository';
import { PessoaRepository }        from '../importacao/repositories/pessoa.repository';

import { CredencialModule }        from '../importacao/credenciais/credencial.module';
import { VarejoFacilModule }       from '../importacao/varejo-facil/varejo-facil.module';

/**
 * ImportJobModule
 *
 * Agrupa o serviço de jobs (SSE + persistência) e o executor
 * que roda as importações no backend de forma autônoma.
 */
@Module({
  imports: [
    CredencialModule,   // CredencialService — lê credenciais da tabela `credenciais`
    VarejoFacilModule,  // VarejoFacilHttpService — cliente HTTP da API VF
  ],
  controllers: [ImportJobController],
  providers: [
    ImportJobService,
    ImportJobExecutorService,
    MercadologiaRepository,
    ProdutoRepository,
    FinanceiroRepository,
    FrenteLojaRepository,
    EstoqueRepository,
    FiscalRepository,
    PessoaRepository,
  ],
  exports: [ImportJobService],
})
export class ImportJobModule {}
