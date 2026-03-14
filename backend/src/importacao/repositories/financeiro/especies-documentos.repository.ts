// financeiro/especies-documentos.repository.ts
import { Injectable }          from '@nestjs/common';
import { notInArray, sql }     from 'drizzle-orm';
import { DrizzleService }      from '../../../database/drizzle.service';
import { especiesDocumentos }  from '../../../database/schema';

@Injectable()
export class EspeciesDocumentosRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarEspeciesDocumento(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const e of list) {
        tx.insert(especiesDocumentos)
          .values({
            especieId:   e.id          ?? null,
            descricao:   e.descricao   ?? null,
            codigoBacen: e.codigoBacen ?? null,
            status:      'S',
          })
          .onConflictDoUpdate({
            target:   especiesDocumentos.especieId,
            set:      { descricao: sql`excluded.descricao`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(especiesDocumentos.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
