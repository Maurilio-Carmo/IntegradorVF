// backend/src/job/import-job.service.ts
// MIGRADO: SqliteService (better-sqlite3 RAW) → DrizzleService
// ─────────────────────────────────────────────────────────────────────────────
//
// MUDANÇAS DESTA MIGRAÇÃO:
//   - Removida dependência de SqliteService / better-sqlite3 direto
//   - _criarTabelaSeNecessario() REMOVIDA — tabela gerenciada pelo Drizzle (drizzle-kit migrate)
//   - _persistJob()        usa drizzle.db.insert(importJobs).onConflictDoUpdate()
//   - _loadFromDb()        usa drizzle.db.select().from(importJobs).where()
//   - _recuperarJobsAtivos() usa drizzle.db.select().from(importJobs).where(inArray(...))
//   - _rowToJob()          lê campos camelCase do schema Drizzle (stepsJson, errorMsg, etc.)
//
// MANTIDO INTACTO:
//   - Toda lógica de SSE (Server-Sent Events)
//   - API pública: createJob, startJob, updateStep, completeStep, failStep,
//     completeJob, failJob, cancelJob, getJob, getActiveJobs, registerSseClient
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, OnModuleInit } from '@nestjs/common';
import { eq, inArray, sql }         from 'drizzle-orm';
import { DrizzleService }           from '../database/drizzle.service';
import { AppLoggerService }         from '../logger/logger.service';
import { importJobs }               from '../database/schema';
import { Response }                 from 'express';
import { randomUUID }               from 'crypto';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type JobStatus = 'pending' | 'running' | 'completed' | 'error' | 'cancelled';

export interface JobStep {
  name:      string;
  label:     string;
  status:    JobStatus;
  processed: number;
  total:     number;
  error?:    string;
}

export interface ImportJobModel {
  id:           string;
  dominio:      string;
  label:        string;
  status:       JobStatus;
  steps:        JobStep[];
  createdAt:    string;
  updatedAt:    string;
  completedAt?: string;
  errorMsg?:    string;
}

interface SseEvent {
  event: string;
  data:  object;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ImportJobService implements OnModuleInit {

  /** Jobs em andamento mantidos em memória para velocidade */
  private readonly activeJobs  = new Map<string, ImportJobModel>();

  /** Clientes SSE conectados: jobId → Set<Response> */
  private readonly sseClients  = new Map<string, Set<Response>>();

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly logger:  AppLoggerService,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  onModuleInit(): void {
    // Tabela import_jobs criada via `drizzle-kit migrate` — não criar manualmente
    this._recuperarJobsAtivos();
  }

  // ─── API Pública ──────────────────────────────────────────────────────────

  /**
   * Cria e retorna um novo job de importação.
   * O job é persistido imediatamente no SQLite via Drizzle.
   */
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

    this.activeJobs.set(job.id, job);
    this._persistJob(job);
    this.logger.info(`Job criado: ${job.id} (${label})`, 'ImportJob');
    return job;
  }

  startJob(jobId: string): void {
    const job = this._getOrThrow(jobId);
    job.status    = 'running';
    job.updatedAt = new Date().toISOString();
    this._persistJob(job);
    this._broadcast(jobId, 'job:started', { jobId, status: job.status });
  }

  updateStep(
    jobId:     string,
    stepName:  string,
    processed: number,
    total:     number,
    status:    JobStatus = 'running',
  ): void {
    const job  = this._getOrThrow(jobId);
    const step = job.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status    = status;
    step.processed = processed;
    step.total     = total;
    job.updatedAt  = new Date().toISOString();

    this._persistJob(job);

    const pct = total > 0 ? Math.min(Math.floor((processed / total) * 100), 99) : null;
    this._broadcast(jobId, 'step:progress', {
      jobId, step: stepName, stepLabel: step.label, processed, total, pct, status,
    });
  }

  completeStep(jobId: string, stepName: string, total: number): void {
    const job  = this._getOrThrow(jobId);
    const step = job.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status    = 'completed';
    step.processed = total;
    step.total     = total;
    job.updatedAt  = new Date().toISOString();

    this._persistJob(job);
    this._broadcast(jobId, 'step:completed', {
      jobId, step: stepName, stepLabel: step.label, total, pct: 100,
    });
  }

  failStep(jobId: string, stepName: string, errorMsg: string): void {
    const job  = this._getOrThrow(jobId);
    const step = job.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status   = 'error';
    step.error    = errorMsg;
    job.updatedAt = new Date().toISOString();

    this._persistJob(job);
    this._broadcast(jobId, 'step:error', { jobId, step: stepName, errorMsg });
    this.logger.error(`Job ${jobId} step ${stepName} falhou: ${errorMsg}`, 'ImportJob');
  }

  completeJob(jobId: string): void {
    const job = this._getOrThrow(jobId);
    job.status      = 'completed';
    job.completedAt = new Date().toISOString();
    job.updatedAt   = job.completedAt;

    this._persistJob(job);
    this._broadcast(jobId, 'job:completed', { jobId, status: 'completed' });
    this._cleanupJob(jobId, 5000);
    this.logger.info(`Job concluído: ${jobId}`, 'ImportJob');
  }

  failJob(jobId: string, errorMsg: string): void {
    const job = this._getOrThrow(jobId);
    job.status    = 'error';
    job.errorMsg  = errorMsg;
    job.updatedAt = new Date().toISOString();

    this._persistJob(job);
    this._broadcast(jobId, 'job:error', { jobId, status: 'error', errorMsg });
    this._cleanupJob(jobId, 5000);
    this.logger.error(`Job falhou: ${jobId} — ${errorMsg}`, 'ImportJob');
  }

  cancelJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (!job) return;
    job.status    = 'cancelled';
    job.updatedAt = new Date().toISOString();
    this._persistJob(job);
    this._broadcast(jobId, 'job:cancelled', { jobId });
    this._cleanupJob(jobId, 1000);
  }

  /** Retorna snapshot do job (memória → SQLite como fallback) */
  getJob(jobId: string): ImportJobModel | undefined {
    return this.activeJobs.get(jobId) ?? this._loadFromDb(jobId);
  }

  /** Jobs com status running ou pending — usado pelo frontend no boot */
  getActiveJobs(): ImportJobModel[] {
    return Array.from(this.activeJobs.values()).filter(
      j => j.status === 'running' || j.status === 'pending',
    );
  }

  // ─── SSE ──────────────────────────────────────────────────────────────────

  registerSseClient(jobId: string, res: Response): void {
    res.setHeader('Content-Type',      'text/event-stream');
    res.setHeader('Cache-Control',     'no-cache');
    res.setHeader('Connection',        'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx: desabilita buffering
    res.flushHeaders();

    if (!this.sseClients.has(jobId)) this.sseClients.set(jobId, new Set());
    this.sseClients.get(jobId)!.add(res);

    // Envia snapshot imediato para reconexão após reload
    const job = this.getJob(jobId);
    if (job) this._sendToClient(res, { event: 'job:snapshot', data: job });

    res.on('close', () => {
      this.sseClients.get(jobId)?.delete(res);
      this.logger.info(`SSE client desconectado do job ${jobId}`, 'ImportJob');
    });

    this.logger.info(`SSE client conectado ao job ${jobId}`, 'ImportJob');
  }

  // ─── Privado ──────────────────────────────────────────────────────────────

  private _getOrThrow(jobId: string): ImportJobModel {
    const job = this.activeJobs.get(jobId);
    if (!job) throw new Error(`Job não encontrado: ${jobId}`);
    return job;
  }

  private _broadcast(jobId: string, event: string, data: object): void {
    const clients = this.sseClients.get(jobId);
    if (!clients?.size) return;
    clients.forEach(res => this._sendToClient(res, { event, data }));
  }

  private _sendToClient(res: Response, payload: SseEvent): void {
    try {
      res.write(`event: ${payload.event}\n`);
      res.write(`data: ${JSON.stringify(payload.data)}\n\n`);
    } catch {
      // Cliente já desconectou — ignorar
    }
  }

  /**
   * Persiste/atualiza o job no SQLite via Drizzle.
   * Usa INSERT ... ON CONFLICT DO UPDATE para garantir idempotência.
   */
  private _persistJob(job: ImportJobModel): void {
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
      this.logger.error(`Erro ao persistir job ${job.id}: ${err.message}`, 'ImportJob');
    }
  }

  /** Carrega um job do SQLite via Drizzle (fallback de reconexão) */
  private _loadFromDb(jobId: string): ImportJobModel | undefined {
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

  /** Recupera jobs running/pending do SQLite para memória ao iniciar o módulo */
  private _recuperarJobsAtivos(): void {
    try {
      const rows = this.drizzle.db
        .select()
        .from(importJobs)
        .where(inArray(importJobs.status, ['running', 'pending']))
        .all();

      for (const row of rows) {
        const job = this._rowToJob(row);

        // Jobs "running" que sobreviveram a um restart ficam em limbo —
        // marcamos como 'error' para que o frontend saiba reiniciar.
        if (job.status === 'running') {
          job.status   = 'error';
          job.errorMsg = 'Servidor reiniciado durante a importação. Por favor, reinicie.';
          this._persistJob(job);
        }

        this.activeJobs.set(job.id, job);
      }

      if (rows.length) {
        this.logger.info(`${rows.length} job(s) recuperados do SQLite`, 'ImportJob');
      }
    } catch (err: any) {
      this.logger.error(`Erro ao recuperar jobs: ${err.message}`, 'ImportJob');
    }
  }

  /** Converte row Drizzle (camelCase) → ImportJobModel */
  private _rowToJob(row: typeof importJobs.$inferSelect): ImportJobModel {
    return {
      id:          row.id,
      dominio:     row.dominio,
      label:       row.label,
      status:      row.status as JobStatus,
      steps:       JSON.parse(row.stepsJson ?? '[]'),
      createdAt:   row.createdAt  ?? new Date().toISOString(),
      updatedAt:   row.updatedAt  ?? new Date().toISOString(),
      completedAt: row.completedAt ?? undefined,
      errorMsg:    row.errorMsg   ?? undefined,
    };
  }

  /** Remove job da memória após delay (mantém no SQLite como histórico) */
  private _cleanupJob(jobId: string, delayMs: number): void {
    setTimeout(() => {
      this.activeJobs.delete(jobId);
      this.sseClients.delete(jobId);
    }, delayMs);
  }
}
