// backend/src/importacao/importacao.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

// Reaproveita o service legado via require() durante a transição
// Substituir por SqliteService.query() direto numa futura refatoração
const ImportacaoService = require('../../services/importacao-service');

/**
 * Controller para endpoints gerais do módulo de importação.
 * Atualmente expõe apenas a rota de estatísticas de contagem por tabela.
 */
@ApiTags('Importação · Utils')
@Controller('api/importacao')
export class ImportacaoController {

  @Get('estatisticas')
  @ApiOperation({ summary: 'Contagem de registros por tabela no SQLite' })
  async estatisticas() {
    return ImportacaoService.obterEstatisticas();
  }
}
