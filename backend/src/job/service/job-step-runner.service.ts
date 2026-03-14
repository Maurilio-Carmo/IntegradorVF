// backend/src/job/job-step-runner.service.ts
// Responsabilidade única: executar um step (fetch página a página → save → SSE).

import { Injectable }              from '@nestjs/common';
import { CredencialVF }            from '../../importacao/service/credencial.service';
import { VarejoFacilHttpService }  from '../../importacao/service/varejo-facil-http.service';
import { AppLoggerService }        from '../../logger/logger.service';
import { ImportJobService }        from './import-job.service';
import { StepDef }                 from '../job.types';

@Injectable()
export class JobStepRunnerService {

  constructor(
    private readonly jobService: ImportJobService,
    private readonly vf:         VarejoFacilHttpService,
    private readonly logger:     AppLoggerService,
  ) {}

  async run(
    jobId:    string,
    stepName: string,
    cred:     CredencialVF,
    def:      StepDef,
  ): Promise<void> {
    try {
      this.jobService.updateStep(jobId, stepName, 0, 0, 'running');

      let totalProcessado = 0;

      const totalFetched = await this.vf.fetchAll(
        cred,
        def.endpoint,
        async (items: any[], offset: number, total: number) => {
          await def.save(items);
          totalProcessado += items.length;
          this.jobService.updateStep(jobId, stepName, totalProcessado, total);
          this.logger.info(
            `  ${stepName}: ${totalProcessado}/${total > 0 ? total : '?'} (offset=${offset})`,
            'StepRunner',
          );
        },
        'id',
      );

      this.jobService.completeStep(jobId, stepName, totalFetched);
      this.logger.info(`✅ ${stepName}: ${totalFetched} registros`, 'StepRunner');

    } catch (err: any) {
      this.jobService.failStep(jobId, stepName, err.message);
      this.logger.error(`❌ ${stepName}: ${err.message}`, 'StepRunner');
      throw err;
    }
  }
}
