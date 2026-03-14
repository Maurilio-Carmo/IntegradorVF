// backend/src/job/job-sse.service.ts
// Responsabilidade única: gerenciar conexões SSE e broadcasting de eventos.

import { Injectable }       from '@nestjs/common';
import { Response }         from 'express';
import { AppLoggerService } from '../../logger/logger.service';
import { ImportJobModel, SseEvent } from '../job.types';

@Injectable()
export class JobSseService {

  private readonly clients = new Map<string, Set<Response>>();

  constructor(private readonly logger: AppLoggerService) {}

  register(jobId: string, res: Response, snapshot?: ImportJobModel): void {
    res.setHeader('Content-Type',      'text/event-stream');
    res.setHeader('Cache-Control',     'no-cache');
    res.setHeader('Connection',        'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    if (!this.clients.has(jobId)) this.clients.set(jobId, new Set());
    this.clients.get(jobId)!.add(res);

    if (snapshot) this._send(res, { event: 'job:snapshot', data: snapshot });

    res.on('close', () => {
      this.clients.get(jobId)?.delete(res);
      this.logger.info(`SSE desconectado: ${jobId}`, 'JobSse');
    });

    this.logger.info(`SSE conectado: ${jobId}`, 'JobSse');
  }

  broadcast(jobId: string, event: string, data: object): void {
    const set = this.clients.get(jobId);
    if (!set?.size) return;
    set.forEach(res => this._send(res, { event, data }));
  }

  cleanup(jobId: string): void {
    this.clients.delete(jobId);
  }

  private _send(res: Response, payload: SseEvent): void {
    try {
      res.write(`event: ${payload.event}\n`);
      res.write(`data: ${JSON.stringify(payload.data)}\n\n`);
    } catch {
      // Cliente desconectou — ignorar
    }
  }
}
