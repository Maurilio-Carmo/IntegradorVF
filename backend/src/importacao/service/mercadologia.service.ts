// backend/src/importacao/mercadologia/mercadologia.service.ts
import { Injectable } from '@nestjs/common';
import {
  SecoesRepository,
  GruposRepository,
  SubgruposRepository,
} from '../repositories';

@Injectable()
export class MercadologiaService {
  constructor(
    private readonly secoes:    SecoesRepository,
    private readonly grupos:    GruposRepository,
    private readonly subgrupos: SubgruposRepository,
  ) {}

  importarSecoes(data: any[])    { return this.secoes.importarSecoes(data); }
  importarGrupos(data: any[])    { return this.grupos.importarGrupos(data); }
  importarSubgrupos(data: any[]) { return this.subgrupos.importarSubgrupos(data); }
}