// backend/src/sincronizacao/sincronizacao.controller.ts
import { Controller, Get, Post, Param, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader }                       from '@nestjs/swagger';
import { SincronizacaoService }                                   from './sincronizacao.service';
import { ExecutarSyncDto }                                        from './dto/executar-sync.dto';

/**
 * Endpoints do motor de sincronização SQLite ↔ API externa.
 * Requer x-api-url e x-api-key nos headers para operar.
 */
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
  @ApiHeader({ name: 'x-api-url', required: true, description: 'URL base da API VF' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Token de autenticação' })
  executar(
    @Body()    dto: ExecutarSyncDto,
    @Headers() headers: Record<string, string>,
  ) {
    return this.service.executarSincronizacao(dto.dominio, {
      apiUrl: headers['x-api-url'],
      apiKey: headers['x-api-key'],
    });
  }

  @Post('reprocessar/:dominio/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reprocessa um registro específico com status E (erro)' })
  @ApiHeader({ name: 'x-api-url', required: true })
  @ApiHeader({ name: 'x-api-key', required: true })
  reprocessar(
    @Param('dominio') dominio: string,
    @Param('id')      id: string,
    @Headers()        headers: Record<string, string>,
  ) {
    return this.service.reprocessarRegistro(dominio, id, {
      apiUrl: headers['x-api-url'],
      apiKey: headers['x-api-key'],
    });
  }

  @Get('historico')
  @ApiOperation({ summary: 'Últimas 50 execuções de sincronização registradas' })
  historico() {
    return this.service.obterHistorico();
  }
}
