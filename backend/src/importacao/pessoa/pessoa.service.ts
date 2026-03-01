// backend/src/importacao/pessoa/pessoa.service.ts
import { Injectable } from '@nestjs/common';
import { PessoaRepository } from '../repositories/pessoa.repository';

/**
 * PessoaService
 * Delega para PessoaRepository.
 * Sem bridge CJS — NestJS puro.
 */
@Injectable()
export class PessoaService {
  constructor(private readonly pessoa: PessoaRepository) {}

  importarLojas(data: any[])        { return this.pessoa.importarLojas(data); }
  importarClientes(data: any[])     { return this.pessoa.importarClientes(data); }
  importarFornecedores(data: any[]) { return this.pessoa.importarFornecedores(data); }
}
