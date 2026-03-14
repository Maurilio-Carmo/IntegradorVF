// backend/src/job/import-job.module.ts

import { Module }                    from '@nestjs/common';
import { ImportJobController }       from './import-job.controller';
import { ImportJobService }          from './service/import-job.service';
import { ImportJobExecutorService }  from './service/import-job-executor.service';
import { JobStoreService }           from './service/job-store.service';
import { JobPersistenceService }     from './service/job-persistence.service';
import { JobSseService }             from './service/job-sse.service';
import { JobStepRunnerService }      from './service/job-step-runner.service';
import { ImportacaoModule }          from '../importacao/module/importacao.module';
import { CredencialModule }          from '../importacao/module/credencial.module';
import { VarejoFacilModule }         from '../importacao/module/varejo-facil.module';

@Module({
  imports: [
    ImportacaoModule,
    CredencialModule,
    VarejoFacilModule,
  ],
  controllers: [ImportJobController],
  providers: [
    JobStoreService,
    JobPersistenceService,
    JobSseService,
    JobStepRunnerService,
    ImportJobService,
    ImportJobExecutorService,
  ],
  exports: [ImportJobService],
})
export class ImportJobModule {}
