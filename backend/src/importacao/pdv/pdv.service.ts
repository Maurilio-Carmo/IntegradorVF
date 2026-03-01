// backend/src/importacao/pdv/pdv.service.ts
import { Injectable } from '@nestjs/common';
import { FrenteLojaRepository } from '../repositories/frente-loja.repository';

/**
 * PdvService
 * Delega para FrenteLojaRepository.
 * Sem bridge CJS — NestJS puro.
 */
@Injectable()
export class PdvService {
  constructor(private readonly frenteLoja: FrenteLojaRepository) {}

  importarFormasPagamento(data: any[])     { return this.frenteLoja.importarFormasPagamento(data); }
  importarPagamentosPDV(data: any[])       { return this.frenteLoja.importarPagamentosPDV(data); }
  importarRecebimentosPDV(data: any[])     { return this.frenteLoja.importarRecebimentosPDV(data); }
  importarMotivosDesconto(data: any[])     { return this.frenteLoja.importarMotivosDesconto(data); }
  importarMotivosDevolucao(data: any[])    { return this.frenteLoja.importarMotivosDevolucao(data); }
  importarMotivosCancelamento(data: any[]) { return this.frenteLoja.importarMotivosCancelamento(data); }
}
