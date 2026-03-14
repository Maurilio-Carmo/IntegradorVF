// pessoa/lojas.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { lojas }             from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class LojasRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarLojas(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const l of list) {
        tx.insert(lojas)
          .values({
            lojaId:             l.id                    ?? null,
            nome:               l.nome                  ?? null,
            fantasia:           l.nomeFantasia           ?? null,
            perfilFiscal:       l.perfilFiscal           ?? null,
            atividadeEconomica: l.atividadeEconomica     ?? null,
            ramoAtuacaoId:      l.ramoAtuacaoId          ?? null,
            agenteValidacao:    l.agenteValidacao        ?? null,
            crt:                l.crt                    ?? null,
            matriz:             M.bool(l.matriz),
            sigla:              l.sigla                  ?? null,
            mail:               l.email                  ?? null,
            telefone:           l.telefone               ?? null,
            cep:                l.enderecos?.cep         ?? null,
            uf:                 l.enderecos?.uf          ?? null,
            cidade:             l.enderecos?.municipio   ?? null,
            logradouro:         l.enderecos?.logradouro  ?? null,
            numero:             l.enderecos?.numero      ?? null,
            bairro:             l.enderecos?.bairro      ?? null,
            tipo:               l.tipo                   ?? null,
            tipoContribuinte:   l.tipoContribuinte       ?? null,
            ativo:              M.bool(l.ativo !== false),
            ecommerce:          M.bool(l.ecommerce),
            locaisDaLojaIds:    M.ids(l.locaisDaLojaIds),
            status:             'S',
          })
          .onConflictDoUpdate({
            target:   lojas.lojaId,
            set:      { nome: sql`excluded.nome`, ativo: sql`excluded.ativo`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(lojas.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
