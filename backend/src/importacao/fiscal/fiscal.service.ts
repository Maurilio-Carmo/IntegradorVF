// backend/src/importacao/fiscal/fiscal.service.ts
import { Injectable } from '@nestjs/common';

const ImportacaoService = require('../../services/importacao-service');

@Injectable()
export class FiscalService {
  importarRegimeTributario(data: any[])    { return ImportacaoService.importarRegimeTributario(data); }
  importarSituacoesFiscais(data: any[])    { return ImportacaoService.importarSituacoesFiscais(data); }
  importarTiposOperacoes(data: any[])      { return ImportacaoService.importarTiposOperacoes(data); }
  importarImpostosFederais(data: any[])    { return ImportacaoService.importarImpostosFederais(data); }
  importarTabelasTributarias(data: any[])  { return ImportacaoService.importarTabelasTributarias(data); }
  importarCenariosFiscais(data: any[])     { return ImportacaoService.importarCenariosFiscais(data); }
}
