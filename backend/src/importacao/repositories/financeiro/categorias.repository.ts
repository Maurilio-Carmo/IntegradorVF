// financeiro/categorias.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { categorias }        from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class CategoriasRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarCategorias(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const c of list) {
        tx.insert(categorias)
          .values({
            categoriaId:    c.id                       ?? null,
            descricao:      c.descricao                ?? null,
            categoriaPaiId: c.codigoDaCategoriaPai     ?? null,
            codigoContabil: c.codigoContabilExterno    ?? null,
            inativa:        M.bool(c.inativa),
            posicao:        c.posicao                  ?? null,
            classificacao:  c.classificacaoDaCategoria ?? null,
            tipo:           c.tipoDeCategoria          ?? null,
            status:         'S',
          })
          .onConflictDoUpdate({
            target:   categorias.categoriaId,
            set:      { descricao: sql`excluded.descricao`, inativa: sql`excluded.inativa`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(categorias.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
