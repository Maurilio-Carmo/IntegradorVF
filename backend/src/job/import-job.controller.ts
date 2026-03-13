// backend/src/job/import-job.controller.ts
// ─────────────────────────────────────────────────────────────────────────────
// CORREÇÃO BUG #2: IniciarJobDto agora aceita `step` opcional.
//   POST /api/import-job/start { dominio: 'produto', step: 'marcas' }
//   → executor.iniciar('produto', 'marcas') → roda só aquele step
//   → executor.iniciar('produto')           → roda o domínio completo
// ─────────────────────────────────────────────────────────────────────────────

import {
  Controller, Get, Post, Delete,
  Param, Body, Res, HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody }   from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Response }                          from 'express';
import { ImportJobService, ImportJob }       from './import-job.service';
import { ImportJobExecutorService }          from './import-job-executor.service';

class IniciarJobDto {
  @IsString()
  @IsNotEmpty()
  dominio: string;
  // 'produto' | 'financeiro' | 'frenteLoja' | 'estoque' | 'fiscal' | 'pessoa'

  @IsString()
  @IsOptional()
  step?: string;
  // Ex: 'marcas' | 'produtos' | 'categorias' | ...
  // Quando presente → roda apenas esse step.
  // Quando ausente  → roda o domínio completo em sequência.
}

@ApiTags('Import · Jobs')
@Controller('api/import-job')
export class ImportJobController {

  constructor(
    private readonly jobService: ImportJobService,
    private readonly executor:   ImportJobExecutorService,
  ) {}

  @Post('start')
  @HttpCode(201)
  @ApiOperation({ summary: 'Inicia job de importação (individual ou completo)' })
  @ApiBody({ type: IniciarJobDto })
  async start(@Body() body: IniciarJobDto): Promise<{ jobId: string }> {
    // ✅ Passa step para o executor (pode ser undefined = domínio completo)
    const jobId = await this.executor.iniciar(body.dominio, body.step);
    return { jobId };
  }

  @Get('active')
  @ApiOperation({ summary: 'Lista jobs em andamento (para reconexão SSE no boot)' })
  getActiveJobs(): ImportJob[] {
    return this.jobService.getActiveJobs();
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Snapshot atual de um job (sem streaming)' })
  getJob(@Param('jobId') jobId: string): ImportJob {
    const job = this.jobService.getJob(jobId);
    if (!job) throw new NotFoundException(`Job não encontrado: ${jobId}`);
    return job;
  }

  @Get(':jobId/events')
  @ApiOperation({ summary: 'Stream SSE de progresso do job' })
  streamJobEvents(@Param('jobId') jobId: string, @Res() res: Response): void {
    const job = this.jobService.getJob(jobId);
    if (!job) {
      res.status(404).json({ message: `Job não encontrado: ${jobId}` });
      return;
    }
    this.jobService.registerSseClient(jobId, res);
  }

  @Delete(':jobId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancela um job em andamento' })
  cancelJob(@Param('jobId') jobId: string): { cancelled: boolean } {
    this.jobService.cancelJob(jobId);
    return { cancelled: true };
  }
}