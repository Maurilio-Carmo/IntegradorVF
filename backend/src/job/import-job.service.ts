// backend/src/import-job/import-job.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SqliteService } from '../database/sqlite.service';
import { AppLoggerService } from '../logger/logger.service';
import { Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ImportJobService
 *
 * PROBLEMA RESOLVIDO:
 *   Quando o frontend rodava a importação inteiramente no browser (JS puro),
 *   recarregar a página matava o processo — todo progresso era perdido.
 *
 * SOLUÇÃO:
 *   A importação agora roda inteiramente no BACKEND (Node.js).
 *   O frontend apenas:
 *     1. Dispara o job via POST /api/import-job/start
 *     2. Acompanha o progresso via SSE   GET  /api/import-job/:jobId/events
 *     3. Ao recarregar, verifica jobs ativos via GET /api/import-job/active
 *        e se reconecta ao stream SSE do job existente.
 *
 * PERSISTÊNCIA:
 *   O estado de cada job é gravado na tabela `import_jobs` do SQLite a cada
 *   atualização de progresso.  Isso garante que, mesmo que o backend reinicie,
 *   o último estado seja recuperável.
 *
 * SSE (Server-Sent Events):
 *   Escolhido em vez de WebSockets por ser mais simples, unidirecional
 *   (servidor → cliente) e compatível com qualquer HTTP/1.1.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type JobStatus = 'pending' | 'running' | 'completed' | 'error' | 'cancelled';

export interface JobStep {
  name: string;       // ex: 'produtos'
  label: string;      // ex: 'Produtos'
  status: JobStatus;
  processed: number;
  total: number;
  error?: string;
}

export interface ImportJob {
  id: string;
  dominio: string;    // ex: 'produto', 'financeiro', 'tudo'
  label: string;      // ex: 'Importar Tudo — Produto'
  status: JobStatus;
  steps: JobStep[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMsg?: string;
}

/** Evento enviado via SSE */
interface SseEvent {
  event: string;
  data: object;
}

// ─── Service ────────────────────────────────────────────────────────────────

@Injectable()
export class ImportJobService implements OnModuleInit {

  /** Jobs em andamento mantidos em memória para velocidade */
  private readonly activeJobs = new Map<string, ImportJob>();

  /** Clientes SSE conectados a cada job  jobId → Set<Response> */
  private readonly sseClients = new Map<string, Set<Response>>();

  constructor(
    private readonly sqlite: SqliteService,
    private readonly logger: AppLoggerService,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  onModuleInit() {
    this._criarTabelaSeNecessario();
    this._recuperarJobsAtivos();
  }

  // ─── API Pública ──────────────────────────────────────────────────────────

  /**
   * Cria e retorna um novo job de importação.
   * O job é persistido imediatamente no SQLite.
   *
   * @param dominio  Identificador do módulo ('produto', 'financeiro', ...)
   * @param label    Texto amigável para a UI
   * @param steps    Lista de etapas com nome e label
   */
  createJob(dominio: string, label: string, steps: Pick<JobStep, 'name' | 'label'>[]): ImportJob {
    const job: ImportJob = {
      id:        randomUUID(),
      dominio,
      label,
      status:    'pending',
      steps:     steps.map(s => ({ ...s, status: 'pending', processed: 0, total: 0 })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.activeJobs.set(job.id, job);
    this._persistJob(job);
    this.logger.info(`Job criado: ${job.id} (${label})`, 'ImportJob');
    return job;
  }

  /**
   * Marca o job como iniciado.
   */
  startJob(jobId: string): void {
    const job = this._getOrThrow(jobId);
    job.status    = 'running';
    job.updatedAt = new Date().toISOString();
    this._persistJob(job);
    this._broadcast(jobId, 'job:started', { jobId, status: job.status });
  }

  /**
   * Atualiza o progresso de uma etapa.
   * Dispara evento SSE para todos os clientes conectados.
   *
   * @param processed  Registros já processados nesta etapa
   * @param total      Total de registros da etapa (0 = desconhecido)
   */
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
      jobId,
      step: stepName,
      stepLabel: step.label,
      processed,
      total,
      pct,
      status,
    });
  }

  /**
   * Marca uma etapa como concluída.
   */
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
      jobId,
      step: stepName,
      stepLabel: step.label,
      total,
      pct: 100,
    });
  }

  /**
   * Marca uma etapa como falha.
   */
  failStep(jobId: string, stepName: string, errorMsg: string): void {
    const job  = this._getOrThrow(jobId);
    const step = job.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status = 'error';
    step.error  = errorMsg;
    job.updatedAt = new Date().toISOString();

    this._persistJob(job);
    this._broadcast(jobId, 'step:error', { jobId, step: stepName, errorMsg });
    this.logger.error(`Job ${jobId} step ${stepName} falhou: ${errorMsg}`, 'ImportJob');
  }

  /**
   * Conclui o job inteiro com sucesso.
   */
  completeJob(jobId: string): void {
    const job = this._getOrThrow(jobId);
    job.status      = 'completed';
    job.completedAt = new Date().toISOString();
    job.updatedAt   = job.completedAt;

    this._persistJob(job);
    this._broadcast(jobId, 'job:completed', { jobId, status: 'completed' });
    this._cleanupJob(jobId, 5000); // remove da memória após 5s
    this.logger.info(`Job concluído: ${jobId}`, 'ImportJob');
  }

  /**
   * Falha o job inteiro.
   */
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

  /**
   * Cancela um job em andamento.
   */
  cancelJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (!job) return;
    job.status    = 'cancelled';
    job.updatedAt = new Date().toISOString();
    this._persistJob(job);
    this._broadcast(jobId, 'job:cancelled', { jobId });
    this._cleanupJob(jobId, 1000);
  }

  /**
   * Retorna o snapshot atual de um job (para reconexão do frontend).
   */
  getJob(jobId: string): ImportJob | undefined {
    // Tenta memória primeiro, depois SQLite
    return this.activeJobs.get(jobId) ?? this._loadFromDb(jobId);
  }

  /**
   * Lista todos os jobs com status running ou pending.
   * Usado pelo frontend no boot para verificar se há importação em andamento.
   */
  getActiveJobs(): ImportJob[] {
    return Array.from(this.activeJobs.values()).filter(
      j => j.status === 'running' || j.status === 'pending',
    );
  }

  // ─── SSE ──────────────────────────────────────────────────────────────────

  /**
   * Registra um cliente SSE.
   * Imediatamente envia o snapshot atual do job para que o cliente possa
   * restaurar a UI — fundamental na reconexão após reload de página.
   */
  registerSseClient(jobId: string, res: Response): void {
    // Headers SSE
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx: desabilita buffering
    res.flushHeaders();

    if (!this.sseClients.has(jobId)) {
      this.sseClients.set(jobId, new Set());
    }
    this.sseClients.get(jobId)!.add(res);

    // Envia snapshot atual para sincronizar cliente que acabou de conectar
    const job = this.getJob(jobId);
    if (job) {
      this._sendToClient(res, { event: 'job:snapshot', data: job });
    }

    // Remove cliente ao desconectar
    res.on('close', () => {
      this.sseClients.get(jobId)?.delete(res);
      this.logger.info(`SSE client desconectado do job ${jobId}`, 'ImportJob');
    });

    this.logger.info(`SSE client conectado ao job ${jobId}`, 'ImportJob');
  }

  // ─── Privado ──────────────────────────────────────────────────────────────

  private _getOrThrow(jobId: string): ImportJob {
    const job = this.activeJobs.get(jobId);
    if (!job) throw new Error(`Job não encontrado: ${jobId}`);
    return job;
  }

  /** Envia evento SSE para todos os clientes conectados a um job */
  private _broadcast(jobId: string, event: string, data: object): void {
    const clients = this.sseClients.get(jobId);
    if (!clients?.size) return;
    const payload: SseEvent = { event, data };
    clients.forEach(res => this._sendToClient(res, payload));
  }

  /** Serializa e envia um evento SSE para um cliente */
  private _sendToClient(res: Response, payload: SseEvent): void {
    try {
      res.write(`event: ${payload.event}\n`);
      res.write(`data: ${JSON.stringify(payload.data)}\n\n`);
    } catch {
      // Cliente já desconectou — ignorar
    }
  }

  /** Persiste/atualiza o job no SQLite */
  private _persistJob(job: ImportJob): void {
    try {
      this.sqlite.run(
        `INSERT OR REPLACE INTO import_jobs
         (id, dominio, label, status, steps_json, created_at, updated_at, completed_at, error_msg)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.id,
          job.dominio,
          job.label,
          job.status,
          JSON.stringify(job.steps),
          job.createdAt,
          job.updatedAt,
          job.completedAt ?? null,
          job.errorMsg    ?? null,
        ],
      );
    } catch (err: any) {
      this.logger.error(`Erro ao persistir job ${job.id}: ${err.message}`, 'ImportJob');
    }
  }

  /** Carrega um job do SQLite (usado no fallback de reconexão) */
  private _loadFromDb(jobId: string): ImportJob | undefined {
    try {
      const row = this.sqlite.get<any>(
        `SELECT * FROM import_jobs WHERE id = ?`, [jobId],
      );
      if (!row) return undefined;
      return this._rowToJob(row);
    } catch {
      return undefined;
    }
  }

  /** Cria a tabela import_jobs se não existir */
  private _criarTabelaSeNecessario(): void {
    this.sqlite.run(`
      CREATE TABLE IF NOT EXISTS import_jobs (
        id           TEXT PRIMARY KEY,
        dominio      TEXT NOT NULL,
        label        TEXT NOT NULL,
        status       TEXT NOT NULL DEFAULT 'pending',
        steps_json   TEXT NOT NULL DEFAULT '[]',
        created_at   TEXT NOT NULL,
        updated_at   TEXT NOT NULL,
        completed_at TEXT,
        error_msg    TEXT
      )
    `);
  }

  /** Carrega jobs running/pending do SQLite para a memória ao iniciar o módulo */
  private _recuperarJobsAtivos(): void {
    try {
      const rows = this.sqlite.query<any>(
        `SELECT * FROM import_jobs WHERE status IN ('running', 'pending') ORDER BY created_at DESC`,
      );
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

  /** Converte linha do SQLite em ImportJob */
  private _rowToJob(row: any): ImportJob {
    return {
      id:          row.id,
      dominio:     row.dominio,
      label:       row.label,
      status:      row.status as JobStatus,
      steps:       JSON.parse(row.steps_json ?? '[]'),
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
      completedAt: row.completed_at ?? undefined,
      errorMsg:    row.error_msg   ?? undefined,
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