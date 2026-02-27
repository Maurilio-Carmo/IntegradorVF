// backend/src/common/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Captura todas as exceções não tratadas e retorna JSON padronizado.
 * Registrado globalmente em main.ts via app.useGlobalFilters().
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const status  = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : (exception instanceof Error ? exception.message : 'Erro interno do servidor');

    const body = {
      statusCode: status,
      timestamp:  new Date().toISOString(),
      path:       request.url,
      message,
    };

    // Loga apenas erros 5xx — não polui o console com 404 / 400
    if (status >= 500) {
      this.log.error(`${request.method} ${request.url} → ${status}`, exception instanceof Error ? exception.stack : '');
    }

    response.status(status).json(body);
  }
}