// backend/src/importacao/fiscal/fiscal.service.ts
import { Injectable } from '@nestjs/common';
import {
  RegimeTributarioRepository,
  SituacoesFiscaisRepository,
  TiposOperacoesRepository,
  ImpostosFederaisRepository,
  TabelasTributariasRepository,
  CenariosFiscaisRepository,
} from '../repositories';

@Injectable()
export class FiscalService {
  constructor(
    private readonly regimeTributario:   RegimeTributarioRepository,
    private readonly situacoesFiscais:   SituacoesFiscaisRepository,
    private readonly tiposOperacoes:     TiposOperacoesRepository,
    private readonly impostosFederais:   ImpostosFederaisRepository,
    private readonly tabelasTributarias: TabelasTributariasRepository,
    private readonly cenariosFiscais:    CenariosFiscaisRepository,
  ) {}

  importarRegimeTributario(data: any[])   { return this.regimeTributario.importarRegimeTributario(data); }
  importarSituacoesFiscais(data: any[])   { return this.situacoesFiscais.importarSituacoesFiscais(data); }
  importarTiposOperacoes(data: any[])     { return this.tiposOperacoes.importarTiposOperacoes(data); }
  importarImpostosFederais(data: any[])   { return this.impostosFederais.importarImpostosFederais(data); }
  importarTabelasTributarias(data: any[]) { return this.tabelasTributarias.importarTabelasTributarias(data); }
  importarCenariosFiscais(data: any[])    { return this.cenariosFiscais.importarCenariosFiscais(data); }
}