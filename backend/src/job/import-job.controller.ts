// backend/src/job/import-job.controller.ts

import {
  Controller, Get, Post, Delete,
  Param, Body, Res, HttpCode, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody }   from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Response }                          from 'express';
import { ImportJobService }                  from './service/import-job.service';
import { ImportJobExecutorService }          from './service/import-job-executor.service';
import { ImportJobModel }                    from './job.types';

class IniciarJobDto {
  @IsString() @IsNotEmpty()
  dominio: string;

  @IsString() @IsOptional()
  step?: string;
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
  @ApiOperation({ summary: 'Inicia job de importação (domínio completo ou step individual)' })
  @ApiBody({ type: IniciarJobDto })
  async start(@Body() body: IniciarJobDto): Promise<{ jobId: string }> {
    const jobId = await this.executor.iniciar(body.dominio, body.step);
    return { jobId };
  }

  @Get('active')
  @ApiOperation({ summary: 'Lista jobs em andamento (reconexão SSE no boot)' })
  getActiveJobs(): ImportJobModel[] {
    return this.jobService.getActiveJobs();
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Snapshot atual de um job (sem streaming)' })
  getJob(@Param('jobId') jobId: string): ImportJobModel {
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
