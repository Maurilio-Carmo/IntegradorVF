// backend/src/importacao/fiscal/fiscal.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }             from '@nestjs/swagger';
import { FiscalService }                     from './fiscal.service';
import { ImportarArrayDto }                  from '../dto/importar-array.dto';

/**
 * Controller de importação do domínio fiscal.
 * Porta as 6 rotas POST de routes/importacao/fiscal.js.
 */
@ApiTags('Importação · Fiscal')
@Controller('api/importacao')
export class FiscalController {
  constructor(private readonly service: FiscalService) {}

  @Post('importar-regime-tributario')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa regimes tributários → SQLite' })
  importarRegimeTributario(@Body() body: ImportarArrayDto) {
    return this.service.importarRegimeTributario(body.data);
  }

  @Post('importar-situacoes-fiscais')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa situações fiscais (CST/CSOSN) → SQLite' })
  importarSituacoesFiscais(@Body() body: ImportarArrayDto) {
    return this.service.importarSituacoesFiscais(body.data);
  }

  @Post('importar-tipos-operacoes')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa tipos de operações fiscais → SQLite' })
  importarTiposOperacoes(@Body() body: ImportarArrayDto) {
    return this.service.importarTiposOperacoes(body.data);
  }

  @Post('importar-impostos-federais')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa tabelas de impostos federais → SQLite' })
  importarImpostosFederais(@Body() body: ImportarArrayDto) {
    return this.service.importarImpostosFederais(body.data);
  }

  @Post('importar-tabelas-tributarias')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa tabelas tributárias → SQLite' })
  importarTabelasTributarias(@Body() body: ImportarArrayDto) {
    return this.service.importarTabelasTributarias(body.data);
  }

  @Post('importar-cenarios-fiscais')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa cenários fiscais → SQLite' })
  importarCenariosFiscais(@Body() body: ImportarArrayDto) {
    return this.service.importarCenariosFiscais(body.data);
  }
}
