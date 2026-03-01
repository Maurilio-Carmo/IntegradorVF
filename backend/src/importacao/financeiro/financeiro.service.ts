// backend/src/importacao/financeiro/financeiro.service.ts
import { Injectable } from '@nestjs/common';
import { FinanceiroRepository } from '../repositories/financeiro.repository';

/**
 * FinanceiroService
 * Delega para FinanceiroRepository.
 * Sem bridge CJS — NestJS puro.
 */
@Injectable()
export class FinanceiroService {
  constructor(private readonly financeiro: FinanceiroRepository) {}

  importarCategorias(data: any[])       { return this.financeiro.importarCategorias(data); }
  importarAgentes(data: any[])          { return this.financeiro.importarAgentes(data); }
  importarContasCorrentes(data: any[])  { return this.financeiro.importarContasCorrentes(data); }
  importarEspeciesDocumento(data: any[]) { return this.financeiro.importarEspeciesDocumento(data); }
  importarHistoricoPadrao(data: any[])  { return this.financeiro.importarHistoricoPadrao(data); }
}
