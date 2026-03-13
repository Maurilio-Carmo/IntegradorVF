// pessoa/clientes.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { clientes }          from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class ClientesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarClientes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const c of list) {
        tx.insert(clientes)
          .values({
            clienteId:         c.id                             ?? null,
            tipoDePessoa:      c.tipoDePessoa                   ?? null,
            documento:         c.documento                      ?? null,
            nome:              c.nome                           ?? null,
            fantasia:          c.nomeFantasia                   ?? null,
            holdingId:         c.holdingId                      ?? 1,
            tipoContribuinte:  c.tipoContribuinte               ?? 'ISENTO',
            inscricaoEstadual: c.inscricaoEstadual              ?? 'ISENTO',
            telefone1:         c.telefone                       ?? null,
            telefone2:         c.telefone2                      ?? null,
            email:             c.email                          ?? null,
            dataNascimento:    M.date(c.dataNascimento),
            estadoCivil:       c.estadoCivil                    ?? null,
            sexo:              c.sexo                           ?? null,
            orgaoPublico:      M.bool(c.orgaoPublico),
            retemIss:          M.bool(c.retemIss),
            ramo:              c.ramo                           ?? 0,
            observacao:        c.observacao                     ?? null,
            tipoPreco:         c.tipoPreco                      ?? 1,
            tipoBloqueio:      c.tipoBloqueio                   ?? 0,
            desconto:          c.desconto                       ?? 0,
            tabelaPrazo:       c.tabelaPrazo                    ?? 'PRZ',
            prazo:             c.prazo                          ?? 30,
            corte:             c.corte                          ?? null,
            vendedorId:        c.vendedorId                     ?? null,
            cep:               c.enderecos?.cep                 ?? null,
            logradouro:        c.enderecos?.logradouro          ?? null,
            numero:            c.enderecos?.numero              ?? null,
            complemento:       c.enderecos?.complemento         ?? null,
            referencia:        c.enderecos?.pontoDeReferencia   ?? null,
            bairro:            c.enderecos?.bairro              ?? null,
            municipio:         c.enderecos?.municipio           ?? null,
            ibge:              c.enderecos?.codigoIbge          ?? null,
            uf:                c.enderecos?.uf                  ?? null,
            pais:              c.enderecos?.codigoDoPais        ?? null,
            dataCadastro:      M.date(c.dataDeCadastro),
            status:            'U',
          })
          .onConflictDoUpdate({
            target:   clientes.clienteId,
            set:      { nome: sql`excluded.nome`, documento: sql`excluded.documento`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(clientes.status, ['C', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
