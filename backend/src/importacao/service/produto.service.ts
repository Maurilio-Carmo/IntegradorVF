// backend/src/importacao/service/produto.service.ts

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
  ProdutoMinMaxRepository,
  ProdutoRegimesRepository,
  ProdutoComponentesRepository,
  ProdutoImpostosFederaisRepository,
} from '../repositories';

@Injectable()
export class ProdutoService {

  constructor(
    private readonly secoes:                  SecoesRepository,
    private readonly grupos:                  GruposRepository,
    private readonly subgrupos:               SubgruposRepository,
    private readonly marcas:                  MarcasRepository,
    private readonly familias:                FamiliasRepository,
    private readonly produtos:                ProdutosRepository,
    private readonly produtoAuxiliares:       ProdutoAuxiliaresRepository,
    private readonly produtoFornecedores:     ProdutoFornecedoresRepository,
    // ── Tabelas filhas (dados aninhados no payload de /produto/produtos) ───
    private readonly produtoMinMax:           ProdutoMinMaxRepository,
    private readonly produtoRegimes:          ProdutoRegimesRepository,
    private readonly produtoComponentes:      ProdutoComponentesRepository,
    private readonly produtoImpostosFederais: ProdutoImpostosFederaisRepository,
  ) {}

  // ── Métodos de importação ─────────────────────────────────────────────────

  importarSecoes(data: any[])    { return this.secoes.importarSecoes(data); }
  importarGrupos(data: any[])    { return this.grupos.importarGrupos(data); }
  importarSubgrupos(data: any[]) { return this.subgrupos.importarSubgrupos(data); }
  importarMarcas(data: any[])    { return this.marcas.importarMarcas(data); }
  importarFamilias(data: any[])  { return this.familias.importarFamilias(data); }
  importarProdutos(data: any[]) { return this.produtos.importarProdutos(data); }
  importarProdutoAuxiliares(data: any[])   { return this.produtoAuxiliares.importarProdutoAuxiliares(data); }
  importarProdutoFornecedores(data: any[]) { return this.produtoFornecedores.importarProdutoFornecedores(data); }

  // ── Métodos de importação individual das tabelas filhas ───────────────────
  // Disponíveis para reprocessamentos isolados no futuro.

  importarProdutoMinMax(data: any[])           { return this.produtoMinMax.importarProdutoMinMax(data); }
  importarProdutoRegimes(data: any[])          { return this.produtoRegimes.importarProdutoRegimes(data); }
  importarProdutoComponentes(data: any[])      { return this.produtoComponentes.importarProdutoComponentes(data); }
  importarProdutoImpostosFederais(data: any[]) { return this.produtoImpostosFederais.importarProdutoImpostosFederais(data); }

  // ── Helper ────────────────────────────────────────────────────────────────

  /** Retorna todos os produtoIds — usado pelo step de fornecedores por produto. */
  listarProdutoIds(): number[] {
    return this.produtos.listarIds();
  }
}