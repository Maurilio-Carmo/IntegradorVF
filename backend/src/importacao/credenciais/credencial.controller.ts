// backend/src/importacao/credenciais/credencial.controller.ts
import {
  Controller, Get, Post, Delete, Body, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation }          from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt } from 'class-validator';
import { Type }                           from 'class-transformer';
import { CredencialService }              from './credencial.service';

class SalvarCredencialDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  lojaId: number;

  @IsString()
  @IsNotEmpty()
  urlApi: string;

  @IsString()
  @IsNotEmpty()
  tokenApi: string;
}

/**
 * CredencialController
 *
 * Endpoints:
 *   GET    /api/credencial/status  → Verifica se está configurado
 *   GET    /api/credencial         → Retorna dados salvos (sem expor token completo)
 *   POST   /api/credencial         → Salva / atualiza credenciais
 *   DELETE /api/credencial         → Remove credenciais
 */
@ApiTags('Credencial · API Varejo Fácil')
@Controller('api/credencial')
export class CredencialController {
  constructor(private readonly service: CredencialService) {}

  /** Verifica se há credencial configurada (sem expor dados sensíveis) */
  @Get('status')
  @ApiOperation({ summary: 'Verifica se as credenciais da API estão configuradas' })
  status() {
    const cred = this.service.carregarOuNull();
    return {
      configurado: !!cred,
      lojaId:      cred?.lojaId  ?? null,
      urlApi:      cred?.urlApi  ?? null,
      // token não é retornado — apenas um hint dos últimos 6 caracteres
      tokenHint:   cred ? `****${cred.tokenApi.slice(-6)}` : null,
    };
  }

  /** Retorna credencial atual (hint do token para preencher formulário) */
  @Get()
  @ApiOperation({ summary: 'Retorna credenciais salvas (token ocultado)' })
  carregar() {
    const cred = this.service.carregarOuNull();
    if (!cred) return { configurado: false };
    return {
      configurado: true,
      lojaId:      cred.lojaId,
      urlApi:      cred.urlApi,
      tokenHint:   `****${cred.tokenApi.slice(-6)}`,
    };
  }

  /** Salva / atualiza credenciais no SQLite */
  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Salva credenciais da API Varejo Fácil no banco local' })
  salvar(@Body() body: SalvarCredencialDto) {
    return this.service.salvar({
      lojaId:   body.lojaId,
      urlApi:   body.urlApi,
      tokenApi: body.tokenApi,
    });
  }

  /** Remove as credenciais */
  @Delete()
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove as credenciais salvas' })
  limpar() {
    return this.service.limpar();
  }
}
