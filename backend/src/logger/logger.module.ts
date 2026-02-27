// backend/src/logger/logger.module.ts
import { Global, Module }   from '@nestjs/common';
import { AppLoggerService } from './logger.service';

/**
 * Módulo global de logs.
 * @Global → injetável em qualquer serviço sem importar o módulo.
 */
@Global()
@Module({
  providers: [AppLoggerService],
  exports:   [AppLoggerService],
})
export class LoggerModule {}
