// backend/src/importacao/estoque/estoque.service.ts
import { Injectable } from '@nestjs/common';

const ImportacaoService = require('../../../services/importacao-service');

@Injectable()
export class EstoqueService {
  importarLocalEstoque(data: any[])  { return ImportacaoService.importarLocalEstoque(data); }
  importarTiposAjustes(data: any[])  { return ImportacaoService.importarTiposAjustes(data); }
  importarSaldoEstoque(data: any[])  { return ImportacaoService.importarSaldoEstoque(data); }
}
