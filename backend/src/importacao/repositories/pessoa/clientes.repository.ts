// backend/src/importacao/repositories/pessoa/clientes.repository.ts

import { Injectable }           from '@nestjs/common';
import { and, notInArray, sql } from 'drizzle-orm';
import { DrizzleService }       from '../../../database/drizzle.service';
import { clientes, clienteEnderecos } from '../../../database/schema';
import { SqliteMapper as M }    from '../../../common/sqlite-mapper';

// Tipos de endereço válidos conforme enum do schema
const TIPOS_VALIDOS = new Set(['PRINCIPAL', 'ENTREGA', 'COBRANCA']);

@Injectable()
export class ClientesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarClientes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const c of list) {
        const clienteId: number = c.id ?? c.clienteId ?? null;
        if (!clienteId) continue;

        // ── 1. Upsert do cliente (sem campos de endereço) ─────────────────
        const dadosCadastrais = {
          tipoDePessoa:      c.tipoDePessoa                ?? null,
          documento:         c.numeroDoDocumento           ?? c.documento ?? null,
          nome:              c.nome                        ?? null,
          fantasia:          c.nomeFantasia                ?? null,
          holdingId:         c.holdingId                   ?? 1,
          tipoContribuinte:  c.tipoContribuinte            ?? 'ISENTO',
          inscricaoEstadual: c.inscricaoEstadual           ?? 'ISENTO',
          telefone1:         c.telefone                    ?? null,
          telefone2:         c.telefone2                   ?? null,
          email:             c.email                       ?? null,
          dataNascimento:    M.date(c.dataNascimento),
          estadoCivil:       c.estadoCivil                 ?? null,
          sexo:              c.sexo                        ?? null,
          orgaoPublico:      M.bool(c.orgaoPublico),
          retemIss:          M.bool(c.retemIss),
          ramo:              c.ramo                        ?? 0,
          observacao:        c.observacao                  ?? null,
          tipoPreco:         c.tipoPreco                   ?? 1,
          tipoBloqueio:      c.tipoBloqueio                ?? 0,
          desconto:          c.desconto                    ?? 0,
          tabelaPrazo:       c.tabelaPrazo                 ?? 'PRZ',
          prazo:             c.prazo                       ?? 30,
          corte:             c.corte                       ?? null,
          vendedorId:        c.vendedorId                  ?? null,
          dataCadastro:      M.date(c.dataDeCadastro),
        };

        tx.insert(clientes)
          .values({ clienteId, ...dadosCadastrais, status: 'S' })
          .onConflictDoNothing()
          .run();

        tx.update(clientes)
          .set({ ...dadosCadastrais, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(and(
            sql`${clientes.clienteId} = ${clienteId}`,
            notInArray(clientes.status, ['C', 'U', 'D']),
          ))
          .run();

        // ── 2. Upsert dos endereços ───────────────────────────────────────
        const enderecos = _normalizarEnderecos(c);

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

          tx.insert(clienteEnderecos)
            .values({ clienteId, tipoEndereco, ...dadosEndereco, status: 'S' })
            .onConflictDoNothing()
            .run();

          tx.update(clienteEnderecos)
            .set({ ...dadosEndereco, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(and(
              sql`${clienteEnderecos.clienteId} = ${clienteId}`,
              sql`${clienteEnderecos.tipoEndereco} = ${tipoEndereco}`,
              notInArray(clienteEnderecos.status, ['C', 'U', 'D']),
            ))
            .run();
        }
      }
    });

    return { success: true, count: list.length };
  }
}

// ─── Helper: normaliza os diferentes formatos que a API pode retornar ─────────
function _normalizarEnderecos(c: any): any[] {
  if (Array.isArray(c.enderecos) && c.enderecos.length > 0) {
    return c.enderecos;
  }

  if (c.enderecos && typeof c.enderecos === 'object') {
    return [{ tipoEndereco: 'PRINCIPAL', ...c.enderecos }];
  }

  if (c.cep || c.logradouro) {
    return [{
      tipoEndereco: 'PRINCIPAL',
      cep:          c.cep,
      logradouro:   c.logradouro,
      numero:       c.numero,
      complemento:  c.complemento,
      referencia:   c.referencia ?? c.pontoDeReferencia,
      bairro:       c.bairro,
      municipio:    c.municipio,
      ibge:         c.ibge ?? c.codigoIbge,
      uf:           c.uf,
      pais:         c.pais ?? c.codigoDoPais,
    }];
  }

  return [];
}
