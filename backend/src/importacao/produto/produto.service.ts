// backend/src/importacao/produto/produto.service.ts
import { Injectable } from '@nestjs/common';
import { MercadologiaRepository } from '../repositories/mercadologia.repository';
import { ProdutoRepository }      from '../repositories/produto.repository';

/**
 * ProdutoService
 * Delega para MercadologiaRepository (seções/grupos/subgrupos)
 * e ProdutoRepository (marcas/famílias/produtos/aux/fornecedores).
 * Sem bridge CJS — NestJS puro.
 */
@Injectable()
export class ProdutoService {
  constructor(
    private readonly mercadologia: MercadologiaRepository,
    private readonly produto:      ProdutoRepository,
  ) {}

  importarSecoes(data: any[])              { return this.mercadologia.importarSecoes(data); }
  importarGrupos(data: any[])              { return this.mercadologia.importarGrupos(data); }
  importarSubgrupos(data: any[])           { return this.mercadologia.importarSubgrupos(data); }
  importarMarcas(data: any[])              { return this.produto.importarMarcas(data); }
  importarFamilias(data: any[])            { return this.produto.importarFamilias(data); }
  importarProdutos(data: any[], lojaId?: number | null) { return this.produto.importarProdutos(data); }
  importarProdutoAuxiliares(data: any[])   { return this.produto.importarProdutoAuxiliares(data); }
  importarProdutoFornecedores(data: any[]) { return this.produto.importarProdutoFornecedores(data); }
}
