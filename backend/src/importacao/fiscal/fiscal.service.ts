// backend/src/importacao/fiscal/fiscal.service.ts
import { Injectable } from '@nestjs/common';
import { FiscalRepository } from '../repositories/fiscal.repository';

/**
 * FiscalService
 * Delega para FiscalRepository.
 * Sem bridge CJS — NestJS puro.
 */
@Injectable()
export class FiscalService {
  constructor(private readonly fiscal: FiscalRepository) {}

  importarRegimeTributario(data: any[])   { return this.fiscal.importarRegimeTributario(data); }
  importarSituacoesFiscais(data: any[])   { return this.fiscal.importarSituacoesFiscais(data); }
  importarTiposOperacoes(data: any[])     { return this.fiscal.importarTiposOperacoes(data); }
  importarImpostosFederais(data: any[])   { return this.fiscal.importarImpostosFederais(data); }
  importarTabelasTributarias(data: any[]) { return this.fiscal.importarTabelasTributarias(data); }
  importarCenariosFiscais(data: any[])    { return this.fiscal.importarCenariosFiscais(data); }
}
