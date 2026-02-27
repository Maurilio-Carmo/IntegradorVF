// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SqliteService }   from '../database/sqlite.service';
import { FirebirdService } from '../database/firebird.service';
import * as os from 'os';

/**
 * Endpoint de verificação de saúde do sistema.
 * Retorna status de conexão com ambos os bancos e informações do servidor.
 */
@ApiTags('Sistema')
@Controller('health')
export class HealthController {
  constructor(
    private readonly sqlite:   SqliteService,
    private readonly firebird: FirebirdService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check — status geral do sistema' })
  async health() {
    const fb = await this.firebird.testConnection();

    // Testa SQLite com query simples
    let sqliteOk = false;
    try {
      this.sqlite.query('SELECT 1');
      sqliteOk = true;
    } catch {}

    return {
      status:      sqliteOk && fb.connected ? 'ok' : 'degraded',
      version:     '3.0.0',
      timestamp:   new Date().toISOString(),
      nodeVersion: process.version,
      env:         process.env.NODE_ENV ?? 'development',
      databases: {
        sqlite:   sqliteOk ? 'connected' : 'error',
        firebird: fb.connected ? 'connected' : `error: ${fb.message}`,
      },
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        memory:   `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        uptime:   `${Math.round(process.uptime())}s`,
      },
    };
  }
}
