// backend/src/importacao/financeiro/financeiro.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }             from '@nestjs/swagger';
import { FinanceiroService }                 from './financeiro.service';
import { ImportarArrayDto }                  from '../dto/importar-array.dto';

/**
 * Controller de importação do domínio financeiro.
 * Porta as 5 rotas POST de routes/importacao/financeiro.js.
 */
@ApiTags('Importação · Financeiro')
@Controller('api/importacao')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Post('importar-categorias')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa categorias financeiras → SQLite' })
  importarCategorias(@Body() body: ImportarArrayDto) {
    return this.service.importarCategorias(body.data);
  }

  @Post('importar-agentes')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa agentes financeiros → SQLite' })
  importarAgentes(@Body() body: ImportarArrayDto) {
    return this.service.importarAgentes(body.data);
  }

  @Post('importar-contas-correntes')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa contas correntes → SQLite' })
  importarContasCorrentes(@Body() body: ImportarArrayDto) {
    return this.service.importarContasCorrentes(body.data);
  }

  @Post('importar-especies-documento')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa espécies de documento → SQLite' })
  importarEspeciesDocumento(@Body() body: ImportarArrayDto) {
    return this.service.importarEspeciesDocumento(body.data);
  }

  @Post('importar-historico-padrao')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa histórico padrão financeiro → SQLite' })
  importarHistoricoPadrao(@Body() body: ImportarArrayDto) {
    return this.service.importarHistoricoPadrao(body.data);
  }
}
