// backend/src/importacao/pessoa/pessoa.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }             from '@nestjs/swagger';
import { PessoaService }                     from './pessoa.service';
import { ImportarArrayDto }                  from '../dto/importar-array.dto';

/**
 * Controller de importação do domínio de pessoas (lojas, clientes, fornecedores).
 * Porta as 3 rotas POST de routes/importacao/pessoa.js.
 */
@ApiTags('Importação · Pessoa')
@Controller('api/importacao')
export class PessoaController {
  constructor(private readonly service: PessoaService) {}

  @Post('importar-lojas')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa lojas → SQLite' })
  importarLojas(@Body() body: ImportarArrayDto) {
    return this.service.importarLojas(body.data);
  }

  @Post('importar-clientes')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa clientes → SQLite' })
  importarClientes(@Body() body: ImportarArrayDto) {
    return this.service.importarClientes(body.data);
  }

  @Post('importar-fornecedores')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa fornecedores → SQLite' })
  importarFornecedores(@Body() body: ImportarArrayDto) {
    return this.service.importarFornecedores(body.data);
  }
}
