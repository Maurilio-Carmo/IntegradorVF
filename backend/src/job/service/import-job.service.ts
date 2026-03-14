// backend/src/job/import-job.service.ts
// Fachada da camada de aplicação: orquestra JobStore, JobPersistence e JobSse.
// Expõe a API pública consumida pelo controller e pelo executor.

import { Injectable }          from '@nestjs/common';
import { randomUUID }          from 'crypto';
import { Response }            from 'express';
import { AppLoggerService }    from '../../logger/logger.service';
import { JobStoreService }     from './job-store.service';
import { JobPersistenceService } from './job-persistence.service';
import { JobSseService }       from './job-sse.service';
import { ImportJobModel, JobStatus, JobStep } from '../job.types';

@Injectable()
export class ImportJobService {

  constructor(
    private readonly store:       JobStoreService,
    private readonly persistence: JobPersistenceService,
    private readonly sse:         JobSseService,
    private readonly logger:      AppLoggerService,
  ) {}

  // ─── Criação e ciclo de vida ──────────────────────────────────────────────

  createJob(
    dominio: string,
    label:   string,
    steps:   Pick<JobStep, 'name' | 'label'>[],
  ): ImportJobModel {
    const now = new Date().toISOString();
    const job: ImportJobModel = {
      id:        randomUUID(),
      dominio,
      label,
      status:    'pending',
      steps:     steps.map(s => ({ ...s, status: 'pending', processed: 0, total: 0 })),
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(job);
    this.persistence.persist(job);
    this.logger.info(`Job criado: ${job.id} (${label})`, 'ImportJob');
    return job;
  }

  startJob(jobId: string): void {
    const job     = this.store.getOrThrow(jobId);
    job.status    = 'running';
    job.updatedAt = new Date().toISOString();
    this.persistence.persist(job);
    this.sse.broadcast(jobId, 'job:started', { jobId, status: job.status });
  }

  completeJob(jobId: string): void {
    const job       = this.store.getOrThrow(jobId);
    job.status      = 'completed';
    job.completedAt = new Date().toISOString();
    job.updatedAt   = job.completedAt;
    this.persistence.persist(job);
    this.sse.broadcast(jobId, 'job:completed', { jobId, status: 'completed' });
    this._scheduleCleanup(jobId, 5000);
    this.logger.info(`Job concluído: ${jobId}`, 'ImportJob');
  }

  failJob(jobId: string, errorMsg: string): void {
    const job     = this.store.getOrThrow(jobId);
    job.status    = 'error';
    job.errorMsg  = errorMsg;
    job.updatedAt = new Date().toISOString();
    this.persistence.persist(job);
    this.sse.broadcast(jobId, 'job:error', { jobId, status: 'error', errorMsg });
    this._scheduleCleanup(jobId, 5000);
    this.logger.error(`Job falhou: ${jobId} — ${errorMsg}`, 'ImportJob');
  }

  cancelJob(jobId: string): void {
    const job = this.store.get(jobId);
    if (!job) return;
    job.status    = 'cancelled';
    job.updatedAt = new Date().toISOString();
    this.persistence.persist(job);
    this.sse.broadcast(jobId, 'job:cancelled', { jobId });
    this._scheduleCleanup(jobId, 1000);
  }

  // ─── Steps ───────────────────────────────────────────────────────────────

  updateStep(
    jobId:     string,
    stepName:  string,
    processed: number,
    total:     number,
    status:    JobStatus = 'running',
  ): void {
    const job  = this.store.getOrThrow(jobId);
    const step = job.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status    = status;
    step.processed = processed;
    step.total     = total;
    job.updatedAt  = new Date().toISOString();

    this.persistence.persist(job);

    const pct = total > 0 ? Math.min(Math.floor((processed / total) * 100), 99) : null;
    this.sse.broadcast(jobId, 'step:progress', {
      jobId, step: stepName, stepLabel: step.label, processed, total, pct, status,
    });
  }

  completeStep(jobId: string, stepName: string, total: number): void {
    const job  = this.store.getOrThrow(jobId);
    const step = job.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status    = 'completed';
    step.processed = total;
    step.total     = total;
    job.updatedAt  = new Date().toISOString();

    this.persistence.persist(job);
    this.sse.broadcast(jobId, 'step:completed', {
      jobId, step: stepName, stepLabel: step.label, total, pct: 100,
    });
  }

  failStep(jobId: string, stepName: string, errorMsg: string): void {
    const job  = this.store.getOrThrow(jobId);
    const step = job.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status   = 'error';
    step.error    = errorMsg;
    job.updatedAt = new Date().toISOString();

    this.persistence.persist(job);
    this.sse.broadcast(jobId, 'step:error', { jobId, step: stepName, errorMsg });
    this.logger.error(`Step ${stepName} do job ${jobId} falhou: ${errorMsg}`, 'ImportJob');
  }

  // ─── Consultas ───────────────────────────────────────────────────────────

  getJob(jobId: string): ImportJobModel | undefined {
    return this.store.get(jobId) ?? this.persistence.loadFromDb(jobId);
  }

  getActiveJobs(): ImportJobModel[] {
    return this.store.listByStatus('running', 'pending');
  }

  // ─── SSE ─────────────────────────────────────────────────────────────────

  registerSseClient(jobId: string, res: Response): void {
    const snapshot = this.getJob(jobId);
    this.sse.register(jobId, res, snapshot);
  }

  // ─── Privado ─────────────────────────────────────────────────────────────

  private _scheduleCleanup(jobId: string, delayMs: number): void {
    setTimeout(() => {
      this.store.delete(jobId);
      this.sse.cleanup(jobId);
    }, delayMs);
  }
}
