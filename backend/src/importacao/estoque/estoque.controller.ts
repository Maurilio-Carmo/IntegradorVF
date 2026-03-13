// backend/src/importacao/estoque/estoque.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }             from '@nestjs/swagger';
import { EstoqueService }                    from './estoque.service';
import { ImportarArrayDto }                  from '../dto/importar-array.dto';

/**
 * Controller de importação do domínio de estoque.
 * Porta as 3 rotas POST de routes/importacao/estoque.js.
 */
@ApiTags('Importação · Estoque')
@Controller('api/importacao')
export class EstoqueController {
  constructor(private readonly service: EstoqueService) {}

  @Post('importar-local-estoque')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa locais de estoque → SQLite' })
  importarLocalEstoque(@Body() body: ImportarArrayDto) {
    return this.service.importarLocalEstoque(body.data);
  }

  @Post('importar-tipos-ajustes')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa tipos de ajuste de estoque → SQLite' })
  importarTiposAjustes(@Body() body: ImportarArrayDto) {
    return this.service.importarTiposAjustes(body.data);
  }

  @Post('importar-saldo-estoque')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa saldo de estoque por produto → SQLite' })
  importarSaldoEstoque(@Body() body: ImportarArrayDto) {
    return this.service.importarSaldoEstoque(body.data);
  }
}
