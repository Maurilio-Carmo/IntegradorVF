// financeiro/agentes.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { agentes }           from '../../../database/schema';

@Injectable()
export class AgentesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarAgentes(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const a of list) {
        tx.insert(agentes)
          .values({
            agenteId:          a.id                ?? null,
            nome:              a.nome              ?? null,
            fantasia:          a.fantasia          ?? null,
            codigoBanco:       a.codigoDoBanco     ?? null,
            tipo:              a.tipo              ?? null,
            documento:         a.numeroDoDocumento ?? null,
            tipoContribuinte:  a.tipoContribuinte  ?? null,
            inscricaoEstadual: a.inscricaoEstadual ?? null,
            telefone:          a.telefone1         ?? null,
            holdingId:         a.holdingId         ?? null,
            cep:               a.cep               ?? null,
            logradouro:        a.logradouro        ?? null,
            numero:            a.numero            ?? null,
            bairro:            a.bairro            ?? null,
            municipio:         a.municipio         ?? null,
            ibge:              a.ibge              ?? null,
            uf:                a.uf                ?? null,
            pais:              a.pais              ?? null,
            tipoEndereco:      a.tipoEndereco      ?? null,
            status:            'S',
          })
          .onConflictDoUpdate({
            target:   agentes.agenteId,
            set:      { nome: sql`excluded.nome`, documento: sql`excluded.documento`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(agentes.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
