// backend/src/importacao/repositories/pessoa/fornecedores.repository.ts

import { Injectable }           from '@nestjs/common';
import { and, notInArray, sql } from 'drizzle-orm';
import { DrizzleService }       from '../../../database/drizzle.service';
import { fornecedores, fornecedorEnderecos } from '../../../database/schema';
import { SqliteMapper as M }    from '../../../common/sqlite-mapper';

const TIPOS_VALIDOS = new Set(['PRINCIPAL', 'ENTREGA']);

@Injectable()
export class FornecedoresRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarFornecedores(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const f of list) {
        const fornecedorId: number = f.id ?? f.fornecedorId ?? null;
        if (!fornecedorId) continue;

        // ── 1. Upsert do fornecedor (sem campos de endereço) ──────────────
        const dadosCadastrais = {
          tipoPessoa:           f.tipoDePessoa,
          documento:            f.documento                            ?? null,
          nome:                 f.nome                                 ?? null,
          fantasia:             f.fantasia                             ?? null,
          holdingId:            f.holdingId                            ?? null,
          tipoContribuinte:     f.tipoContribuinte                     ?? null,
          inscricaoEstadual:    f.inscricaoEstadual                    ?? null,
          telefone1:            f.telefone                             ?? null,
          telefone2:            f.telefone2                            ?? null,
          email:                f.email                                ?? null,
          tipoFornecedor:       f.tipoFornecedor                       ?? null,
          servico:              M.bool(f.servico),
          transportadora:       M.bool(f.transportadora),
          produtorRural:        M.bool(f.produtorRural),
          inscricaoMunicipal:   f.inscricaoMunicipal                   ?? null,
          tabelaPrazo:          f.tabelaPrazo                          ?? null,
          prazo:                f.prazo                                ?? null,
          prazoEntrega:         f.prazoEntrega                         ?? null,
          tipoFrete:            f.tipoFrete                            ?? null,
          observacao:           f.observacao                           ?? null,
          desativaPedido:       M.bool(f.desativaPedido),
          tipoPedido:           f.tipoPedido                           ?? null,
          regimeEstadual:       f.regimeEstadual                       ?? null,
          destacaSubstituicao:  M.bool(f.destacaSubstituicao),
          consideraDesoneracao: M.bool(f.consideraDesoneracao),
          criadoEm:             M.date(f.dataDeCadastro    ?? f.criadoEm),
          atualizadoEm:         M.date(f.dataDeAtualizacao ?? f.atualizadoEm),
        };

        tx.insert(fornecedores)
          .values({ fornecedorId, ...dadosCadastrais, status: 'S' })
          .onConflictDoNothing()
          .run();

        tx.update(fornecedores)
          .set({ ...dadosCadastrais, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(and(
            sql`${fornecedores.fornecedorId} = ${fornecedorId}`,
            notInArray(fornecedores.status, ['C', 'U', 'D']),
          ))
          .run();

        // ── 2. Upsert dos endereços ───────────────────────────────────────
        const enderecos = _normalizarEnderecos(f);

        for (const end of enderecos) {
          const tipoEndereco = end.tipoEndereco ?? 'PRINCIPAL';
          if (!TIPOS_VALIDOS.has(tipoEndereco)) continue;

          const dadosEndereco = {
            cep:         end.cep                       ?? null,
            logradouro:  end.logradouro                ?? null,
            numero:      end.numero != null ? String(end.numero) : null,
            complemento: end.complemento               ?? null,
            referencia:  end.pontoDeReferencia ?? end.referencia ?? null,
            bairro:      end.bairro                    ?? null,
            municipio:   end.municipio                 ?? null,
            ibge:        end.codigoIbge != null
                           ? String(end.codigoIbge)
                           : (end.ibge != null ? String(end.ibge) : null),
            uf:          end.uf                        ?? null,
            pais:        end.codigoDoPais != null
                           ? String(end.codigoDoPais)
                           : (end.pais != null ? String(end.pais) : null),
          };

          tx.insert(fornecedorEnderecos)
            .values({ fornecedorId, tipoEndereco, ...dadosEndereco, status: 'S' })
            .onConflictDoNothing()
            .run();

          tx.update(fornecedorEnderecos)
            .set({ ...dadosEndereco, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(and(
              sql`${fornecedorEnderecos.fornecedorId} = ${fornecedorId}`,
              sql`${fornecedorEnderecos.tipoEndereco} = ${tipoEndereco}`,
              notInArray(fornecedorEnderecos.status, ['C', 'U', 'D']),
            ))
            .run();
        }
      }
    });

    return { success: true, count: list.length };
  }
}

// ─── Helper: normaliza os diferentes formatos que a API pode retornar ─────────
function _normalizarEnderecos(f: any): any[] {
  if (Array.isArray(f.enderecos) && f.enderecos.length > 0) {
    return f.enderecos;
  }
  if (f.enderecos && typeof f.enderecos === 'object') {
    return [{ tipoEndereco: 'PRINCIPAL', ...f.enderecos }];
  }
  if (f.cep || f.logradouro) {
    return [{
      tipoEndereco: 'PRINCIPAL',
      cep:          f.cep,
      logradouro:   f.logradouro,
      numero:       f.numero,
      complemento:  f.complemento,
      referencia:   f.referencia,
      bairro:       f.bairro,
      municipio:    f.municipio,
      ibge:         f.ibge,
      uf:           f.uf,
      pais:         f.pais,
    }];
  }
  return [];
}
