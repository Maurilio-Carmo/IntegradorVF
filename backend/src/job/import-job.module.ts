// backend/src/job/import-job.module.ts
import { Module }                   from '@nestjs/common';
import { ImportJobController }      from './import-job.controller';
import { ImportJobService }         from './import-job.service';
import { ImportJobExecutorService } from './import-job-executor.service';

import { ImportacaoModule }  from '../importacao/importacao.module';
import { CredencialModule }  from '../importacao/credenciais/credencial.module';
import { VarejoFacilModule } from '../importacao/varejo-facil/varejo-facil.module';

@Module({
  imports: [
    ImportacaoModule,
    CredencialModule,
    VarejoFacilModule,
  ],
  controllers: [ImportJobController],
  providers: [
    ImportJobService,
    ImportJobExecutorService,
  ],
  exports: [ImportJobService],
})
export class ImportJobModule {}