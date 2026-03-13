// backend/src/importacao/pdv/pdv.service.ts
import { Injectable } from '@nestjs/common';
import {
  FormasPagamentoRepository,
  PagamentosPdvRepository,
  RecebimentosPdvRepository,
  MotivoDescontoRepository,
  MotivosDevolucaoRepository,
  MotivosCancelamentoRepository,
} from '../repositories';

@Injectable()
export class PdvService {
  constructor(
    private readonly formasPagamento:      FormasPagamentoRepository,
    private readonly pagamentosPdv:        PagamentosPdvRepository,
    private readonly recebimentosPdv:      RecebimentosPdvRepository,
    private readonly motivosDesconto:      MotivoDescontoRepository,
    private readonly motivosDevolucao:     MotivosDevolucaoRepository,
    private readonly motivosCancelamento:  MotivosCancelamentoRepository,
  ) {}

  importarFormasPagamento(data: any[])     { return this.formasPagamento.importarFormasPagamento(data); }
  importarPagamentosPDV(data: any[])       { return this.pagamentosPdv.importarPagamentosPDV(data); }
  importarRecebimentosPDV(data: any[])     { return this.recebimentosPdv.importarRecebimentosPDV(data); }
  importarMotivosDesconto(data: any[])     { return this.motivosDesconto.importarMotivosDesconto(data); }
  importarMotivosDevolucao(data: any[])    { return this.motivosDevolucao.importarMotivosDevolucao(data); }
  importarMotivosCancelamento(data: any[]) { return this.motivosCancelamento.importarMotivosCancelamento(data); }
}