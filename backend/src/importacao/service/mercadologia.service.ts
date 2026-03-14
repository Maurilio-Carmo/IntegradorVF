// backend/src/importacao/service/mercadologia.service.ts
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

  /** IDs de seções salvas — usados para buscar grupos por seção na API. */
  listarSecaoIds(): number[] {
    return this.secoes.listarIds();
  }

  /** Pares secaoId+grupoId salvos — usados para buscar subgrupos na API. */
  listarGrupoIds(): { secaoId: number; grupoId: number }[] {
    return this.grupos.listarIds();
  }
}
