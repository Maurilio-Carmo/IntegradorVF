// backend/src/importacao/estoque/estoque.service.ts
import { Injectable } from '@nestjs/common';
import {
  LocalEstoqueRepository,
  TiposAjustesRepository,
  SaldoEstoqueRepository,
} from '../repositories';

@Injectable()
export class EstoqueService {
  constructor(
    private readonly localEstoque: LocalEstoqueRepository,
    private readonly tiposAjustes: TiposAjustesRepository,
    private readonly saldoEstoque: SaldoEstoqueRepository,
  ) {}

  importarLocalEstoque(data: any[]) { return this.localEstoque.importarLocalEstoque(data); }
  importarTiposAjustes(data: any[]) { return this.tiposAjustes.importarTiposAjustes(data); }
  importarSaldoEstoque(data: any[]) { return this.saldoEstoque.importarSaldoEstoque(data); }
}