// backend/src/database-control/database-control.controller.ts
import { Controller, Post, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }            from '@nestjs/swagger';
import { DatabaseControlService }           from './database-control.service';

/**
 * Endpoints de manutenção do banco SQLite.
 * Úteis para onboarding (criar), reset de dados e diagnóstico.
 */
@ApiTags('Database Control')
@Controller('api/database')
export class DatabaseControlController {
  constructor(private readonly service: DatabaseControlService) {}

  @Post('criar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cria todas as tabelas executando IntegradorDB.sql (idempotente)' })
  criar() { return this.service.criarTabelas(); }

  @Post('limpar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Apaga todos os registros mantendo a estrutura das tabelas' })
  limpar() { return this.service.limparDados(); }

  @Post('reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'DROP + CREATE — reinicia o banco do zero para nova sincronização' })
  reset() { return this.service.resetCompleto(); }

  @Get('status')
  @ApiOperation({ summary: 'Contagem de registros por tabela — útil para diagnóstico' })
  status() { return this.service.obterEstatisticas(); }
}
