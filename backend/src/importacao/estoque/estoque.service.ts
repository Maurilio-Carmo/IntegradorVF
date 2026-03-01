// backend/src/importacao/estoque/estoque.service.ts
import { Injectable } from '@nestjs/common';
import { EstoqueRepository } from '../repositories/estoque.repository';

/**
 * EstoqueService
 * Delega para EstoqueRepository.
 * Sem bridge CJS — NestJS puro.
 */
@Injectable()
export class EstoqueService {
  constructor(private readonly estoque: EstoqueRepository) {}

  importarLocalEstoque(data: any[]) { return this.estoque.importarLocalEstoque(data); }
  importarTiposAjustes(data: any[]) { return this.estoque.importarTiposAjustes(data); }
  importarSaldoEstoque(data: any[]) { return this.estoque.importarSaldoEstoque(data); }
}
