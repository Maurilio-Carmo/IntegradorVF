// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {

  @Get()
  @ApiOperation({ summary: 'Verifica se a aplicação está no ar' })
  check() {
    return {
      status:    'ok',
      version:   process.env.npm_package_version ?? '3.0.0',
      timestamp: new Date().toISOString(),
      uptime:    Math.floor(process.uptime()),
      node:      process.version,
    };
  }
}