// backend/src/import-job/import-job.controller.ts
import {
  Controller, Get, Post, Delete,
  Param, Body, Res, HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportJobService, ImportJob } from './import-job.service';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ImportJobController
 *
 * Endpoints:
 *
 *  GET  /api/import-job/active
 *       Retorna lista de jobs em andamento.
 *       Usado pelo frontend ao inicializar para detectar importações ativas.
 *
 *  GET  /api/import-job/:jobId
 *       Retorna snapshot de um job (estado atual sem streaming).
 *       Permite que o frontend reconstrua a UI antes de conectar ao SSE.
 *
 *  GET  /api/import-job/:jobId/events   ← SSE
 *       Stream de eventos do job. Ao conectar, envia snapshot imediatamente.
 *       Mantém conexão aberta até job terminar ou cliente desconectar.
 *
 *  DELETE /api/import-job/:jobId
 *       Cancela um job em andamento.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@ApiTags('Import · Jobs')
@Controller('api/import-job')
export class ImportJobController {

  constructor(private readonly jobService: ImportJobService) {}

  // ─── Jobs Ativos ──────────────────────────────────────────────────────────

  @Get('active')
  @ApiOperation({
    summary: 'Lista jobs de importação em andamento',
    description:
      'Chamado pelo frontend ao inicializar. ' +
      'Se houver jobs running/pending, o frontend os reconecta via SSE.',
  })
  getActiveJobs(): ImportJob[] {
    return this.jobService.getActiveJobs();
  }

  // ─── Snapshot ─────────────────────────────────────────────────────────────

  @Get(':jobId')
  @ApiOperation({
    summary: 'Retorna o estado atual de um job (sem streaming)',
  })
  getJob(@Param('jobId') jobId: string): ImportJob {
    const job = this.jobService.getJob(jobId);
    if (!job) throw new NotFoundException(`Job não encontrado: ${jobId}`);
    return job;
  }

  // ─── SSE ──────────────────────────────────────────────────────────────────

  /**
   * Abre um stream SSE para acompanhar o progresso de um job.
   *
   * Eventos emitidos:
   *   job:snapshot   — snapshot completo enviado ao conectar (para reconexão)
   *   job:started    — job iniciou
   *   step:progress  — progresso de uma etapa { step, processed, total, pct }
   *   step:completed — etapa concluída         { step, total }
   *   step:error     — etapa falhou            { step, errorMsg }
   *   job:completed  — job concluído           { jobId }
   *   job:error      — job falhou              { jobId, errorMsg }
   *   job:cancelled  — job cancelado           { jobId }
   *
   * O frontend usa estes eventos para atualizar barras de progresso e labels
   * sem manter nenhum estado no browser — ao recarregar, basta reconectar.
   */
  @Get(':jobId/events')
  @ApiOperation({
    summary: 'Stream SSE de progresso do job',
    description:
      'Mantém conexão aberta. Ao conectar, envia snapshot do estado atual ' +
      'para permitir reconexão transparente após reload de página.',
  })
  streamJobEvents(
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ): void {
    const job = this.jobService.getJob(jobId);
    if (!job) {
      res.status(404).json({ message: `Job não encontrado: ${jobId}` });
      return;
    }
    this.jobService.registerSseClient(jobId, res);
  }

  // ─── Cancelamento ─────────────────────────────────────────────────────────

  @Delete(':jobId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancela um job em andamento' })
  cancelJob(@Param('jobId') jobId: string): { cancelled: boolean } {
    this.jobService.cancelJob(jobId);
    return { cancelled: true };
  }
}