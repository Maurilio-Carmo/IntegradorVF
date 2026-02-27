// backend/src/importacao/produto/produto.controller.ts
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation }             from '@nestjs/swagger';
import { ProdutoService }                    from './produto.service';
import { ImportarArrayDto }                  from '../dto/importar-array.dto';

/**
 * Controller de importação de produtos e seus auxiliares.
 * Porta as 8 rotas POST de routes/importacao/produto.js.
 */
@ApiTags('Importação · Produto')
@Controller('api/importacao')
export class ProdutoController {
  constructor(private readonly service: ProdutoService) {}

  @Post('importar-secoes')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa seções mercadológicas → SQLite' })
  importarSecoes(@Body() body: ImportarArrayDto) {
    return this.service.importarSecoes(body.data);
  }

  @Post('importar-grupos')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa grupos mercadológicos → SQLite' })
  importarGrupos(@Body() body: ImportarArrayDto) {
    return this.service.importarGrupos(body.data);
  }

  @Post('importar-subgrupos')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa subgrupos mercadológicos → SQLite' })
  importarSubgrupos(@Body() body: ImportarArrayDto) {
    return this.service.importarSubgrupos(body.data);
  }

  @Post('importar-marcas')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa marcas de produtos → SQLite' })
  importarMarcas(@Body() body: ImportarArrayDto) {
    return this.service.importarMarcas(body.data);
  }

  @Post('importar-familias')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa famílias de produtos → SQLite' })
  importarFamilias(@Body() body: ImportarArrayDto) {
    return this.service.importarFamilias(body.data);
  }

  @Post('importar-produtos')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa produtos com lojaId opcional → SQLite' })
  importarProdutos(@Body() body: ImportarArrayDto) {
    return this.service.importarProdutos(body.data, body.lojaId ?? null);
  }

  @Post('importar-produto-auxiliares')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa dados auxiliares de produtos → SQLite' })
  importarProdutoAuxiliares(@Body() body: ImportarArrayDto) {
    return this.service.importarProdutoAuxiliares(body.data);
  }

  @Post('importar-produto-fornecedores')
  @HttpCode(200)
  @ApiOperation({ summary: 'Importa fornecedores de produtos → SQLite' })
  importarProdutoFornecedores(@Body() body: ImportarArrayDto) {
    return this.service.importarProdutoFornecedores(body.data);
  }
}
