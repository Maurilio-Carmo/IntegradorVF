// backend/src/database-control/database-control.controller.ts

import { Controller, Post, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }            from '@nestjs/swagger';
import { DatabaseControlService }           from './database-control.service';

@ApiTags('Database Control')
@Controller('api/database')
export class DatabaseControlController {
  constructor(private readonly service: DatabaseControlService) {}

  @Post('limpar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Apaga todos os registros mantendo a estrutura das tabelas' })
  limpar() { return this.service.limparDados(); }

  @Post('reset')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Limpa todos os dados (estrutura preservada — gerenciada pelo Drizzle)',
    description: 'Para recriar tabelas do zero use: npm run db:migrate',
  })
  reset() { return this.service.limparDados(); }

  @Get('status')
  @ApiOperation({ summary: 'Contagem de registros por tabela — útil para diagnóstico' })
  status() { return this.service.obterEstatisticas(); }
}
