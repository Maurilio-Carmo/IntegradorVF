// pessoa/fornecedores.repository.ts
import { Injectable }        from '@nestjs/common';
import { notInArray, sql }   from 'drizzle-orm';
import { DrizzleService }    from '../../../database/drizzle.service';
import { fornecedores }      from '../../../database/schema';
import { SqliteMapper as M } from '../../../common/sqlite-mapper';

@Injectable()
export class FornecedoresRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  importarFornecedores(list: any[]) {
    if (!list?.length) return { success: true, count: 0 };

    this.drizzle.db.transaction((tx) => {
      for (const f of list) {
        tx.insert(fornecedores)
          .values({
            fornecedorId:         f.id,
            tipoPessoa:           f.tipoDePessoa          ?? null,
            documento:            f.numeroDoDocumento     ?? null,
            nome:                 f.nome                  ?? null,
            fantasia:             f.fantasia              ?? null,
            holdingId:            f.holdingId             ?? null,
            tipoContribuinte:     f.tipoContribuinte      ?? null,
            inscricaoEstadual:    f.inscricaoEstadual     ?? null,
            telefone1:            f.telefone1             ?? null,
            telefone2:            f.telefone2             ?? null,
            email:                f.email                 ?? null,
            tipoFornecedor:       f.tipoFornecedor        ?? null,
            servico:              M.bool(f.servico),
            transportadora:       M.bool(f.transportadora),
            produtorRural:        M.bool(f.produtorRural),
            inscricaoMunicipal:   f.inscricaoMunicipal    ?? null,
            tabelaPrazo:          f.tabelaPrazo           ?? null,
            prazo:                f.prazo                 ?? null,
            prazoEntrega:         f.prazoEntrega          ?? null,
            tipoFrete:            f.tipoFrete             ?? null,
            observacao:           f.observacao            ?? null,
            desativaPedido:       M.bool(f.desativaPedido),
            tipoPedido:           f.tipoPedido            ?? null,
            regimeEstadual:       f.regimeEstadual        ?? null,
            destacaSubstituicao:  M.bool(f.destacaSubstituicao),
            consideraDesoneracao: M.bool(f.consideraDesoneracao),
            cep:                  f.cep                   ?? null,
            logradouro:           f.logradouro            ?? null,
            numero:               f.numero                ?? null,
            complemento:          f.complemento           ?? null,
            referencia:           f.referencia            ?? null,
            bairro:               f.bairro                ?? null,
            municipio:            f.municipio             ?? null,
            ibge:                 f.ibge                  ?? null,
            uf:                   f.uf                    ?? null,
            pais:                 f.pais                  ?? null,
            criadoEm:             M.date(f.criadoEm),
            atualizadoEm:         M.date(f.atualizadoEm),
            status:               'S',
          })
          .onConflictDoUpdate({
            target:   fornecedores.fornecedorId,
            set:      { nome: sql`excluded.nome`, documento: sql`excluded.documento`, updatedAt: sql`CURRENT_TIMESTAMP` },
            setWhere: notInArray(fornecedores.status, ['C', 'U', 'D']),
          })
          .run();
      }
    });

    return { success: true, count: list.length };
  }
}
