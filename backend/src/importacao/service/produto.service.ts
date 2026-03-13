// backend/src/importacao/produto/produto.service.ts
import { Injectable } from '@nestjs/common';

import {
  SecoesRepository,
  GruposRepository,
  SubgruposRepository,
  MarcasRepository,
  FamiliasRepository,
  ProdutosRepository,
  ProdutoAuxiliaresRepository,
  ProdutoFornecedoresRepository,
} from '../repositories';

@Injectable()
export class ProdutoService {
  constructor(
    private readonly secoes:              SecoesRepository,
    private readonly grupos:              GruposRepository,
    private readonly subgrupos:           SubgruposRepository,
    private readonly marcas:              MarcasRepository,
    private readonly familias:            FamiliasRepository,
    private readonly produtos:            ProdutosRepository,
    private readonly produtoAuxiliares:   ProdutoAuxiliaresRepository,
    private readonly produtoFornecedores: ProdutoFornecedoresRepository,
  ) {}

  importarSecoes(data: any[])              { return this.secoes.importarSecoes(data); }
  importarGrupos(data: any[])              { return this.grupos.importarGrupos(data); }
  importarSubgrupos(data: any[])           { return this.subgrupos.importarSubgrupos(data); }
  importarMarcas(data: any[])              { return this.marcas.importarMarcas(data); }
  importarFamilias(data: any[])            { return this.familias.importarFamilias(data); }
  importarProdutos(data: any[])            { return this.produtos.importarProdutos(data); }
  importarProdutoAuxiliares(data: any[])   { return this.produtoAuxiliares.importarProdutoAuxiliares(data); }
  importarProdutoFornecedores(data: any[]) { return this.produtoFornecedores.importarProdutoFornecedores(data); }
}