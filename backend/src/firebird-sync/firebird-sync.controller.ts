// backend/src/firebird-sync/firebird-sync.controller.ts
import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }                         from '@nestjs/swagger';
import { FirebirdSyncService }                           from './firebird-sync.service';
import { CompararDto }                                   from './dto/comparar.dto';

/**
 * Endpoints de integração SQLite ↔ Firebird 2.5.
 * Permite testar conexão, listar tabelas, comparar datasets e migrar dados.
 */
@ApiTags('Firebird · Sincronização')
@Controller('api/firebird')
export class FirebirdSyncController {
  constructor(private readonly service: FirebirdSyncService) {}

  @Get('status')
  @ApiOperation({ summary: 'Testa conexão com o Firebird 2.5' })
  status() {
    return this.service.testarConexao();
  }

  @Get('tabelas')
  @ApiOperation({ summary: 'Lista tabelas disponíveis no Firebird' })
  tabelas() {
    return this.service.listarTabelas();
  }

  @Post('comparar/:dominio')
  @HttpCode(200)
  @ApiOperation({ summary: 'Compara SQLite ↔ Firebird e retorna diff estruturado' })
  comparar(
    @Param('dominio') dominio: string,
    @Body()           dto: CompararDto,
  ) {
    return this.service.comparar(dominio, dto);
  }

  @Post('migrar/:dominio')
  @HttpCode(200)
  @ApiOperation({ summary: 'Migra dados do SQLite para o Firebird (UPDATE OR INSERT)' })
  migrar(@Param('dominio') dominio: string) {
    return this.service.migrarParaFirebird(dominio);
  }

  @Post('atualizar-sqlite/:dominio')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sobrescreve SQLite com dados do Firebird (sentido inverso)' })
  atualizarSqlite(
    @Param('dominio') dominio: string,
    @Body()           dto: CompararDto,
  ) {
    return this.service.atualizarSqliteFromFirebird(dominio, dto);
  }
}
