// backend/src/importacao/pdv/pdv.service.ts
import { Injectable } from '@nestjs/common';

const ImportacaoService = require('../../../services/importacao-service');

@Injectable()
export class PdvService {
  importarFormasPagamento(data: any[])    { return ImportacaoService.importarFormasPagamento(data); }
  importarPagamentosPdv(data: any[])      { return ImportacaoService.importarPagamentosPdv(data); }
  importarRecebimentosPdv(data: any[])    { return ImportacaoService.importarRecebimentosPdv(data); }
  importarMotivosDesconto(data: any[])    { return ImportacaoService.importarMotivosDesconto(data); }
  importarMotivosDevolucao(data: any[])   { return ImportacaoService.importarMotivosDevolucao(data); }
  importarMotivosCancelamento(data: any[]) { return ImportacaoService.importarMotivosCancelamento(data); }
}
