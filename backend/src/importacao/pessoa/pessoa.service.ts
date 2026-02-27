// backend/src/importacao/pessoa/pessoa.service.ts
import { Injectable } from '@nestjs/common';

const ImportacaoService = require('../../../services/importacao-service');

@Injectable()
export class PessoaService {
  importarLojas(data: any[])        { return ImportacaoService.importarLojas(data); }
  importarClientes(data: any[])     { return ImportacaoService.importarClientes(data); }
  importarFornecedores(data: any[]) { return ImportacaoService.importarFornecedores(data); }
}
