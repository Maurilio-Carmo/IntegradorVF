// backend/src/importacao/financeiro/financeiro.service.ts
import { Injectable } from '@nestjs/common';
import {
  CategoriasRepository,
  AgentesRepository,
  ContasCorrentesRepository,
  EspeciesDocumentosRepository,
  HistoricoPadraoRepository,
  FormasPagamentoRepository,
} from '../repositories';

@Injectable()
export class FinanceiroService {
  constructor(
    private readonly categorias:         CategoriasRepository,
    private readonly agentes:            AgentesRepository,
    private readonly contasCorrentes:    ContasCorrentesRepository,
    private readonly especiesDocumentos: EspeciesDocumentosRepository,
    private readonly historicoPadrao:    HistoricoPadraoRepository,
    private readonly formasPagamento:    FormasPagamentoRepository,
  ) {}

  importarCategorias(data: any[])        { return this.categorias.importarCategorias(data); }
  importarAgentes(data: any[])           { return this.agentes.importarAgentes(data); }
  importarContasCorrentes(data: any[])   { return this.contasCorrentes.importarContasCorrentes(data); }
  importarEspeciesDocumento(data: any[]) { return this.especiesDocumentos.importarEspeciesDocumento(data); }
  importarHistoricoPadrao(data: any[])   { return this.historicoPadrao.importarHistoricoPadrao(data); }
  importarFormasPagamento(data: any[])   { return this.formasPagamento.importarFormasPagamento(data); }
}