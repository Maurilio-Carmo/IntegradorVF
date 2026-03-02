// backend/src/job/import-job.controller.ts
import {
  Controller, Get, Post, Delete,
  Param, Body, Res, HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Response }             from 'express';
import { ImportJobService, ImportJob }  from './import-job.service';
import { ImportJobExecutorService }     from './import-job-executor.service';

class IniciarJobDto {
  @IsString()
  @IsNotEmpty()
  dominio: string;
  // 'produto' | 'financeiro' | 'frenteLoja' | 'estoque' | 'fiscal' | 'pessoa' | 'tudo'
  // Nota: campo `step` é recebido mas ignorado — executor.iniciar() roda o domínio completo.
  // Suporte a etapas individuais pode ser adicionado ao ImportJobExecutorService no futuro.
}

/**
 * ImportJobController
 *
 * Endpoints:
 *
 *  POST   /api/import-job/start          ← NOVO — inicia job de importação
 *  GET    /api/import-job/active         — lista jobs em andamento
 *  GET    /api/import-job/:jobId         — snapshot de um job
 *  GET    /api/import-job/:jobId/events  — stream SSE de progresso
 *  DELETE /api/import-job/:jobId         — cancela um job
 */
@ApiTags('Import · Jobs')
@Controller('api/import-job')
export class ImportJobController {

  constructor(
    private readonly jobService: ImportJobService,
    private readonly executor:   ImportJobExecutorService,
  ) {}

  // ─── Iniciar job ──────────────────────────────────────────────────────────

  /**
   * Inicia um novo job de importação no servidor.
   *
   * O job roda de forma assíncrona — retorna { jobId } imediatamente
   * para que o frontend abra a conexão SSE e acompanhe o progresso.
   *
   * Body: { dominio: string }
   * Response: { jobId: string }
   */
  @Post('start')
  @HttpCode(201)
  @ApiOperation({ summary: 'Inicia job de importação (progresso via SSE)' })
  @ApiBody({ type: IniciarJobDto })
  async start(@Body() body: IniciarJobDto): Promise<{ jobId: string }> {
    const jobId = await this.executor.iniciar(body.dominio);
    return { jobId };
  }

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
  @ApiOperation({ summary: 'Retorna o estado atual de um job (sem streaming)' })
  getJob(@Param('jobId') jobId: string): ImportJob {
    const job = this.jobService.getJob(jobId);
    if (!job) throw new NotFoundException(`Job não encontrado: ${jobId}`);
    return job;
  }

  // ─── SSE ──────────────────────────────────────────────────────────────────

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