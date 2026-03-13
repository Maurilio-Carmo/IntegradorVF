// backend/src/logger/logger.module.ts
import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

/**
 * @Global() — AppLoggerService disponível em todos os módulos.
 */
@Global()
@Module({
  providers: [AppLoggerService],
  exports:   [AppLoggerService],
})
export class LoggerModule {}