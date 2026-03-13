// backend/src/importacao/pdv/pdv.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }             from '@nestjs/swagger';
import { PdvService }                        from './pdv.service';
import { ImportarArrayDto }                  from '../dto/importar-array.dto';

/**
 * Controller de importação do domínio PDV (Ponto de Venda).
 * Porta as 6 rotas POST de routes/importacao/pdv.js.
 */
@ApiTags('Importação · PDV')
@Controller('api/importacao')
export class PdvController {
  constructor(private readonly service: PdvService) {}

  @Post('importar-formas-pagamento')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa formas de pagamento → SQLite' })
  importarFormasPagamento(@Body() body: ImportarArrayDto) {
    return this.service.importarFormasPagamento(body.data);
  }

  @Post('importar-pagamentos-pdv')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa pagamentos do PDV → SQLite' })
  importarPagamentosPdv(@Body() body: ImportarArrayDto) {
    return this.service.importarPagamentosPDV(body.data);
  }

  @Post('importar-recebimentos-pdv')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa recebimentos do PDV → SQLite' })
  importarRecebimentosPdv(@Body() body: ImportarArrayDto) {
    return this.service.importarRecebimentosPDV(body.data);
  }

  @Post('importar-motivos-desconto')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa motivos de desconto → SQLite' })
  importarMotivosDesconto(@Body() body: ImportarArrayDto) {
    return this.service.importarMotivosDesconto(body.data);
  }

  @Post('importar-motivos-devolucao')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa motivos de devolução → SQLite' })
  importarMotivosDevolucao(@Body() body: ImportarArrayDto) {
    return this.service.importarMotivosDevolucao(body.data);
  }

  @Post('importar-motivos-cancelamento')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa motivos de cancelamento → SQLite' })
  importarMotivosCancelamento(@Body() body: ImportarArrayDto) {
    return this.service.importarMotivosCancelamento(body.data);
  }
}
