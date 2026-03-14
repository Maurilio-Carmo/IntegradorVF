// backend/src/sincronizacao/sincronizacao.controller.ts

import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }                         from '@nestjs/swagger';
import { SincronizacaoService }                          from './sincronizacao.service';
import { ExecutarSyncDto }                               from './dto/executar-sync.dto';

@ApiTags('Sincronização')
@Controller('api/sincronizacao')
export class SincronizacaoController {

  constructor(private readonly service: SincronizacaoService) {}

  @Get('pendentes/:dominio')
  @ApiOperation({ summary: 'Lista registros com status C, U ou D (pendentes de sync)' })
  pendentes(@Param('dominio') dominio: string) {
    return this.service.listarPendentes(dominio);
  }

  @Post('executar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Executa sincronização em lote para um domínio' })
  executar(@Body() dto: ExecutarSyncDto) {
    return this.service.executarSincronizacao(dto.dominio);
  }

  @Post('reprocessar/:dominio/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reprocessa um registro específico com status E (erro)' })
  reprocessar(
    @Param('dominio') dominio: string,
    @Param('id')      id: string,
  ) {
    return this.service.reprocessarRegistro(dominio, id);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Últimas 50 execuções de sincronização registradas' })
  historico() {
    return this.service.obterHistorico();
  }
}