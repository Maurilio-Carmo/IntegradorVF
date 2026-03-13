// backend/src/importacao/credenciais/credencial.controller.ts
import {
  Controller, Get, Post, Delete, Body, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation }          from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsNumber, IsPositive, IsInt,
  IsOptional,
} from 'class-validator';
import { Type }                           from 'class-transformer';
import { CredencialService }              from '../service/credencial.service';
import { VarejoFacilHttpService }         from '../varejo-facil/varejo-facil-http.service';

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
 * DTO para testar credenciais sem precisar salvá-las antes.
 * Usado pelo frontend ao clicar em "Testar Conexão" antes de salvar.
 */
class TestarCredencialDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  lojaId?: number;

  @IsOptional()
  @IsString()
  urlApi?: string;

  @IsOptional()
  @IsString()
  tokenApi?: string;
}

/**
 * CredencialController
 *
 * Endpoints:
 *   GET    /api/credencial/status          → Verifica se está configurado
 *   GET    /api/credencial/testar-conexao  → Testa credenciais salvas no SQLite
 *   POST   /api/credencial/testar-conexao  → Testa credenciais fornecidas (sem salvar)
 *   GET    /api/credencial                 → Retorna dados salvos (token ocultado)
 *   POST   /api/credencial                 → Salva / atualiza credenciais
 *   DELETE /api/credencial                 → Remove credenciais
 *
 * ─── FASE 3 — ADICIONADO (refactor/migrate-api-to-backend) ─────────────────
 *
 * PROBLEMA:
 *   O frontend chamava `API.testarConexao()` que executava diretamente a chamada
 *   HTTP à API Varejo Fácil a partir do browser. Isso expunha credenciais no
 *   tráfego do cliente e impedia remover o módulo services/api/.
 *
 * SOLUÇÃO:
 *   Dois novos endpoints delegam o teste ao backend, que usa as credenciais
 *   armazenadas com segurança no SQLite (ou as fornecidas temporariamente):
 *
 *   GET  /testar-conexao          — usa credenciais já salvas (boot/reload)
 *   POST /testar-conexao          — testa credenciais ad-hoc (antes de salvar)
 * ─────────────────────────────────────────────────────────────────────────────
 */
@ApiTags('Credencial · API Varejo Fácil')
@Controller('api/credencial')
export class CredencialController {
  constructor(
    private readonly service: CredencialService,
    private readonly vf:      VarejoFacilHttpService,
  ) {}

  // ─── Status ───────────────────────────────────────────────────────────────

  /** Verifica se há credencial configurada (sem expor dados sensíveis) */
  @Get('status')
  @ApiOperation({ summary: 'Verifica se as credenciais da API estão configuradas' })
  status() {
    const cred = this.service.carregarOuNull();
    return {
      configurado: !!cred,
      lojaId:      cred?.lojaId  ?? null,
      urlApi:      cred?.urlApi  ?? null,
      tokenHint:   cred ? `****${cred.tokenApi.slice(-6)}` : null,
    };
  }

  // ─── Testar Conexão ───────────────────────────────────────────────────────

  /**
   * Testa as credenciais já salvas no SQLite.
   *
   * Usado pelo frontend em:
   *   - Boot da aplicação (testarConexaoSilencioso)
   *   - Após salvar credenciais (fluxo salvar → testar)
   *
   * @returns {{ success: boolean, razaoSocial?: string, error?: string }}
   */
  @Get('testar-conexao')
  @ApiOperation({
    summary:     'Testa a conexão com a API Varejo Fácil usando credenciais salvas',
    description: 'Lê credenciais do SQLite e faz uma chamada GET a /administracao/licenciamento.',
  })
  async testarConexaoSalva() {
    return this._executarTeste(null);
  }

  /**
   * Testa credenciais fornecidas no body — sem salvá-las.
   *
   * Usado pelo frontend quando o usuário clica em "Testar Conexão"
   * antes de salvar (os campos ainda não foram persistidos no SQLite).
   *
   * Se o body vier vazio, usa as credenciais salvas como fallback.
   *
   * @returns {{ success: boolean, razaoSocial?: string, error?: string }}
   */
  @Post('testar-conexao')
  @HttpCode(200)
  @ApiOperation({
    summary:     'Testa credenciais fornecidas no body (sem persistir)',
    description: 'Permite testar antes de salvar. Se nenhuma credencial for passada, usa as salvas.',
  })
  async testarConexaoAdhoc(@Body() body: TestarCredencialDto) {
    const cred = (body.urlApi && body.tokenApi)
      ? { urlApi: body.urlApi, tokenApi: body.tokenApi, lojaId: body.lojaId ?? 1 }
      : null;

    return this._executarTeste(cred);
  }

  // ─── CRUD Credenciais ─────────────────────────────────────────────────────

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

  // ─── Privado ──────────────────────────────────────────────────────────────

  /**
   * Executa o teste de conexão com a API VF.
   * Se `cred` for null, carrega do SQLite via CredencialService.
   */
  private async _executarTeste(
    cred: { urlApi: string; tokenApi: string; lojaId: number } | null,
  ) {
    const credencial = cred ?? this.service.carregarOuNull();

    if (!credencial) {
      return {
        success: false,
        error:   'Credenciais não configuradas. Salve a configuração primeiro.',
      };
    }

    try {
      // Chamada ao endpoint de licenciamento — retorna razão social se OK
      const page = await this.vf.fetchPage(
        credencial,
        'administracao/licenciamento',
        0,
        1,
      );

      const dados = page.items?.[0] ?? page;
      const razaoSocial = dados?.razaoSocial ?? dados?.empresa ?? null;

      return {
        success:     true,
        razaoSocial: razaoSocial ?? 'Conexão estabelecida',
      };

    } catch (err: any) {
      return {
        success: false,
        error:   err.message ?? 'Erro desconhecido',
      };
    }
  }
}
