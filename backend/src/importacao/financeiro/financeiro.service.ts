// backend/src/importacao/financeiro/financeiro.service.ts
import { Injectable } from '@nestjs/common';

const ImportacaoService = require('../../../services/importacao-service');

@Injectable()
export class FinanceiroService {
  importarCategorias(data: any[])        { return ImportacaoService.importarCategorias(data); }
  importarAgentes(data: any[])           { return ImportacaoService.importarAgentes(data); }
  importarContasCorrentes(data: any[])   { return ImportacaoService.importarContasCorrentes(data); }
  importarEspeciesDocumento(data: any[]) { return ImportacaoService.importarEspeciesDocumento(data); }
  importarHistoricoPadrao(data: any[])   { return ImportacaoService.importarHistoricoPadrao(data); }
}
