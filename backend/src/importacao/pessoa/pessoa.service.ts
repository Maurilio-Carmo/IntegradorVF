// backend/src/importacao/pessoa/pessoa.service.ts
import { Injectable } from '@nestjs/common';
import {
  LojasRepository,
  ClientesRepository,
  FornecedoresRepository,
} from '../repositories';

@Injectable()
export class PessoaService {
  constructor(
    private readonly lojas:        LojasRepository,
    private readonly clientes:     ClientesRepository,
    private readonly fornecedores: FornecedoresRepository,
  ) {}

  importarLojas(data: any[])        { return this.lojas.importarLojas(data); }
  importarClientes(data: any[])     { return this.clientes.importarClientes(data); }
  importarFornecedores(data: any[]) { return this.fornecedores.importarFornecedores(data); }
}