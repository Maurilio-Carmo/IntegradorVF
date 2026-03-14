// backend/src/sincronizacao/sincronizacao.service.ts
//
// Responsabilidade: orquestrar o fluxo de sincronização.
//   - Valida domínio e lê credenciais
//   - Consulta registros pendentes no SQLite
//   - Delega o envio HTTP ao SincronizacaoExecutor
//   - Persiste o histórico da execução
//
// Não contém lógica HTTP nem mapeamentos de schema — cada coisa em seu arquivo.

import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, inArray, desc }               from 'drizzle-orm';
import { DrizzleService }                  from '../database/drizzle.service';
import { AppLoggerService }                from '../logger/logger.service';
import { CredencialService }               from '../importacao/service/credencial.service';
import { SincronizacaoExecutor }           from './sincronizacao.executor';
import { syncHistorico }                   from '../database/schema';
import { DOMINIOS_VALIDOS }                from './dto/executar-sync.dto';
import { DOMINIO_TABELA, DOMINIO_PK }      from './sincronizacao.registry';
import { ResultadoSync }                   from './sincronizacao.types';

@Injectable()
export class SincronizacaoService {

  constructor(
    private readonly drizzle:   DrizzleService,
    private readonly logger:    AppLoggerService,
    private readonly credencial: CredencialService,
    private readonly executor:  SincronizacaoExecutor,
  ) {}

  // ─── API Pública ──────────────────────────────────────────────────────────

  /**
   * Lista registros com modificações locais pendentes (status C, U ou D).
   * Registros com status S foram importados da API e não têm pendências.
   */
  listarPendentes(dominio: string) {
    this.validarDominio(dominio);
    const tabela = this.resolverTabela(dominio);

    const registros = this.drizzle.db
      .select()
      .from(tabela)
      .where(inArray((tabela as any).status, ['C', 'U', 'D']))
      .orderBy((tabela as any).updatedAt)
      .all();

    return { dominio, total: registros.length, registros };
  }

  /**
   * Executa a sincronização de todos os registros pendentes de um domínio.
   * Credenciais são lidas do SQLite — nunca passadas por parâmetro HTTP.
   */
  async executarSincronizacao(dominio: string) {
    this.validarDominio(dominio);

    const cred    = this.credencial.carregar();
    const tabela  = this.resolverTabela(dominio);
    const pkField = this.resolverPk(dominio);
    const inicio  = Date.now();

    const pendentes = this.drizzle.db
      .select()
      .from(tabela)
      .where(inArray((tabela as any).status, ['C', 'U', 'D']))
      .orderBy((tabela as any).updatedAt)
      .all();

    this.logger.info(
      `Sync ${dominio}: ${pendentes.length} registros pendentes`,
      'Sincronizacao',
    );

    const resultado: ResultadoSync = {
      criados: 0, atualizados: 0, deletados: 0, erros: 0,
      total: pendentes.length,
    };

    await this.executor.processarEmLote(
      dominio, tabela, pkField, pendentes as any[], cred, resultado,
    );

    const duracao = Date.now() - inicio;
    this._salvarHistorico(dominio, resultado, duracao);

    this.logger.success(
      `Sync ${dominio} concluído em ${duracao}ms`,
      'Sincronizacao',
      resultado,
    );

    return { ...resultado, duracao_ms: duracao, dominio };
  }

  /**
   * Reprocessa um único registro com status E (erro).
   * Credenciais são lidas do SQLite — nunca passadas por parâmetro HTTP.
   */
  async reprocessarRegistro(dominio: string, id: string) {
    this.validarDominio(dominio);

    const cred    = this.credencial.carregar();
    const tabela  = this.resolverTabela(dominio);
    const pkField = this.resolverPk(dominio);

    const registro = this.drizzle.db
      .select()
      .from(tabela)
      .where(eq(pkField, id))
      .get();

    if (!registro) {
      throw new BadRequestException(`Registro ${id} não encontrado em ${dominio}`);
    }
    if ((registro as any).status !== 'E') {
      throw new BadRequestException(
        `Registro ${id} não pode ser reprocessado ` +
        `(status atual: "${(registro as any).status}"). ` +
        `Apenas registros com status "E" podem ser reprocessados.`,
      );
    }

    const resultado: ResultadoSync = {
      criados: 0, atualizados: 0, deletados: 0, erros: 0, total: 1,
    };

    await this.executor.processarUm(dominio, tabela, pkField, registro, cred, resultado);
    return resultado;
  }

  /** Retorna as últimas N execuções de sincronização registradas */
  obterHistorico(limit = 50) {
    const rows = this.drizzle.db
      .select()
      .from(syncHistorico)
      .orderBy(desc(syncHistorico.id))
      .limit(limit)
      .all();

    return rows.map(r => ({
      ...r,
      resultado: r.resultado ? JSON.parse(r.resultado) : null,
    }));
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  private _salvarHistorico(dominio: string, resultado: ResultadoSync, duracaoMs: number): void {
    this.drizzle.db
      .insert(syncHistorico)
      .values({ dominio, resultado: JSON.stringify(resultado), duracaoMs })
      .run();
  }

  private resolverTabela(dominio: string): any {
    const tabela = DOMINIO_TABELA[dominio];
    if (!tabela) {
      throw new BadRequestException(
        `Domínio desconhecido: "${dominio}". ` +
        `Válidos: ${Object.keys(DOMINIO_TABELA).join(', ')}`,
      );
    }
    return tabela;
  }

  private resolverPk(dominio: string): any {
    const pk = DOMINIO_PK[dominio];
    if (!pk) {
      throw new BadRequestException(
        `Chave primária não mapeada para o domínio: "${dominio}". ` +
        `Verifique sincronizacao.registry.ts`,
      );
    }
    return pk;
  }

  private validarDominio(dominio: string): void {
    if (!DOMINIOS_VALIDOS.includes(dominio as any)) {
      throw new BadRequestException(
        `Domínio inválido: "${dominio}". Válidos: ${DOMINIOS_VALIDOS.join(', ')}`,
      );
    }
  }
}
