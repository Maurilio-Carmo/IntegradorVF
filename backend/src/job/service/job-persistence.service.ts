// backend/src/job/job-persistence.service.ts
// Responsabilidade única: ler e gravar jobs no SQLite via Drizzle.

import { Injectable, OnModuleInit }  from '@nestjs/common';
import { eq, inArray, sql }          from 'drizzle-orm';
import { DrizzleService }            from '../../database/drizzle.service';
import { AppLoggerService }          from '../../logger/logger.service';
import { importJobs }                from '../../database/schema';
import { ImportJobModel, JobStatus } from '../job.types';
import { JobStoreService }           from './job-store.service';

@Injectable()
export class JobPersistenceService implements OnModuleInit {

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly store:   JobStoreService,
    private readonly logger:  AppLoggerService,
  ) {}

  onModuleInit(): void {
    this._recuperarJobsAtivos();
  }

  persist(job: ImportJobModel): void {
    try {
      this.drizzle.db
        .insert(importJobs)
        .values({
          id:          job.id,
          dominio:     job.dominio,
          label:       job.label,
          status:      job.status,
          stepsJson:   JSON.stringify(job.steps),
          createdAt:   job.createdAt,
          updatedAt:   job.updatedAt,
          completedAt: job.completedAt ?? null,
          errorMsg:    job.errorMsg    ?? null,
        })
        .onConflictDoUpdate({
          target: importJobs.id,
          set: {
            status:      sql`excluded.status`,
            stepsJson:   sql`excluded.steps_json`,
            updatedAt:   sql`excluded.updated_at`,
            completedAt: sql`excluded.completed_at`,
            errorMsg:    sql`excluded.error_msg`,
          },
        })
        .run();
    } catch (err: any) {
      this.logger.error(`Erro ao persistir job ${job.id}: ${err.message}`, 'JobPersistence');
    }
  }

  loadFromDb(jobId: string): ImportJobModel | undefined {
    try {
      const row = this.drizzle.db
        .select()
        .from(importJobs)
        .where(eq(importJobs.id, jobId))
        .get();
      return row ? this._rowToJob(row) : undefined;
    } catch {
      return undefined;
    }
  }

  private _recuperarJobsAtivos(): void {
    try {
      const rows = this.drizzle.db
        .select()
        .from(importJobs)
        .where(inArray(importJobs.status, ['running', 'pending']))
        .all();

      for (const row of rows) {
        const job = this._rowToJob(row);

        // Jobs interrompidos por restart ficam em limbo — marcamos como erro
        if (job.status === 'running') {
          job.status   = 'error';
          job.errorMsg = 'Servidor reiniciado durante a importação. Reinicie o job.';
          this.persist(job);
        }

        this.store.set(job);
      }

      if (rows.length) {
        this.logger.info(`${rows.length} job(s) recuperados do SQLite`, 'JobPersistence');
      }
    } catch (err: any) {
      this.logger.error(`Erro ao recuperar jobs: ${err.message}`, 'JobPersistence');
    }
  }

  private _rowToJob(row: typeof importJobs.$inferSelect): ImportJobModel {
    return {
      id:          row.id,
      dominio:     row.dominio,
      label:       row.label,
      status:      row.status as JobStatus,
      steps:       JSON.parse(row.stepsJson ?? '[]'),
      createdAt:   row.createdAt   ?? new Date().toISOString(),
      updatedAt:   row.updatedAt   ?? new Date().toISOString(),
      completedAt: row.completedAt ?? undefined,
      errorMsg:    row.errorMsg    ?? undefined,
    };
  }
}
