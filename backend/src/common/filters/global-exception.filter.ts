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
 * Captura qualquer exceção não tratada e retorna JSON padronizado.
 * Registrado globalmente no main.ts via useGlobalFilters().
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx    = host.switchToHttp();
    const res    = ctx.getResponse<Response>();
    const req    = ctx.getRequest<Request>();

    // Determina o status HTTP correto
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extrai a mensagem de erro
    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : { message: (exception as Error)?.message ?? 'Erro interno do servidor' };

    // Loga erros 500 com stack trace
    if (status >= 500) {
      this.log.error(
        `${req.method} ${req.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.log.warn(`${req.method} ${req.url} → ${status}`);
    }

    // Resposta padronizada
    res.status(status).json({
      statusCode: status,
      timestamp:  new Date().toISOString(),
      path:       req.url,
      ...(typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : exceptionResponse),
    });
  }
}
