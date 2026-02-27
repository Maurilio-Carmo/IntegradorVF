// backend/src/importacao/produto/produto.service.ts
import { Injectable } from '@nestjs/common';

/**
 * Delega para o ImportacaoService legado (CJS) durante a transição.
 * TODO (Etapa 6): substituir require() por injeção de SqliteService
 * e implementar a lógica de UPSERT diretamente aqui.
 */
const ImportacaoService = require('../../../services/importacao-service');

@Injectable()
export class ProdutoService {
  importarSecoes(data: any[])              { return ImportacaoService.importarSecoes(data); }
  importarGrupos(data: any[])              { return ImportacaoService.importarGrupos(data); }
  importarSubgrupos(data: any[])           { return ImportacaoService.importarSubgrupos(data); }
  importarMarcas(data: any[])              { return ImportacaoService.importarMarcas(data); }
  importarFamilias(data: any[])            { return ImportacaoService.importarFamilias(data); }
  importarProdutos(data: any[], lojaId: any) { return ImportacaoService.importarProdutos(data, lojaId); }
  importarProdutoAuxiliares(data: any[])   { return ImportacaoService.importarProdutoAuxiliares(data); }
  importarProdutoFornecedores(data: any[]) { return ImportacaoService.importarProdutoFornecedores(data); }
}
