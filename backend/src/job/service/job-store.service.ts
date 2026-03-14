// backend/src/job/job-store.service.ts
// Responsabilidade única: gerenciar o Map em memória dos jobs ativos.

import { Injectable } from '@nestjs/common';
import { ImportJobModel, JobStatus } from '../job.types';

@Injectable()
export class JobStoreService {

  private readonly jobs = new Map<string, ImportJobModel>();

  set(job: ImportJobModel): void {
    this.jobs.set(job.id, job);
  }

  get(jobId: string): ImportJobModel | undefined {
    return this.jobs.get(jobId);
  }

  getOrThrow(jobId: string): ImportJobModel {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job não encontrado: ${jobId}`);
    return job;
  }

  delete(jobId: string): void {
    this.jobs.delete(jobId);
  }

  listByStatus(...statuses: JobStatus[]): ImportJobModel[] {
    return Array.from(this.jobs.values()).filter(j => statuses.includes(j.status));
  }
}
