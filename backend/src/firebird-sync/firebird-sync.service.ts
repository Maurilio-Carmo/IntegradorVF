// backend/src/firebird-sync/firebird-sync.service.ts
import { Injectable }       from '@nestjs/common';
import { SqliteService }    from '../database/sqlite.service';
import { FirebirdService }  from '../database/firebird.service';
import { ComparatorService } from '../comparator/comparator.service';
import { AppLoggerService } from '../logger/logger.service';
import { CompararDto }      from './dto/comparar.dto';

/**
 * Serviço de sincronização bidirecional entre SQLite e Firebird 2.5.
 *
 * Direções disponíveis:
 *   SQLite  → Firebird : migrarParaFirebird()      (usa UPDATE OR INSERT nativo do FB 2.5)
 *   Firebird → SQLite  : atualizarSqliteFromFirebird()
 *   Diff apenas        : comparar()
 */
@Injectable()
export class FirebirdSyncService {
  constructor(
    private readonly sqlite:     SqliteService,
    private readonly firebird:   FirebirdService,
    private readonly comparator: ComparatorService,
    private readonly logger:     AppLoggerService,
  ) {}

  /** Testa a conectividade com o Firebird */
  async testarConexao() {
    return this.firebird.testConnection();
  }

  /** Lista tabelas de usuário no Firebird (exclui tabelas de sistema) */
  async listarTabelas() {
    return this.firebird.query(`
      SELECT TRIM(RDB$RELATION_NAME) AS tabela
      FROM   RDB$RELATIONS
      WHERE  RDB$SYSTEM_FLAG = 0
        AND  RDB$VIEW_BLR IS NULL
      ORDER  BY RDB$RELATION_NAME
    `);
  }

  /**
   * Compara o dataset do SQLite com o do Firebird para um domínio.
   * Retorna { toCreate, toUpdate, toDelete, unchanged, summary }.
   */
  async comparar(dominio: string, dto: CompararDto) {
    const tabelaFB     = dto.tabelaFirebird ?? dominio.toUpperCase();
    const sqliteData   = this.sqlite.query(`SELECT * FROM ${dominio}`);
    const firebirdData = await this.firebird.query(`SELECT * FROM ${tabelaFB}`);

    return this.comparator.compare(sqliteData, firebirdData, {
      keyField:      dto.campoChave      ?? 'id',
      compareFields: dto.camposComparar  ?? [],
    });
  }

  /**
   * Migra todos os registros do SQLite para o Firebird.
   * Usa UPDATE OR INSERT (sintaxe nativa do Firebird 2.5) — idempotente.
   */
  async migrarParaFirebird(dominio: string) {
    const registros = this.sqlite.query(`SELECT * FROM ${dominio}`);
    const tabela    = dominio.toUpperCase();
    let migrados    = 0;
    const erros: any[] = [];

    for (const reg of registros) {
      try {
        await this.upsertFirebird(tabela, reg);
        migrados++;
      } catch (err) {
        erros.push({ id: reg.id, erro: err.message });
        this.logger.error(`Falha ao migrar ${tabela}[${reg.id}]`, err.message);
      }
    }

    this.logger.success(`Migração ${tabela}: ${migrados}/${registros.length}`, { erros: erros.length });

    return {
      migrados,
      total:          registros.length,
      erros:          erros.length,
      detalhes_erros: erros,
    };
  }

  /**
   * Sobrescreve o SQLite com dados do Firebird (sentido inverso).
   * Útil para importar dados já existentes no legado.
   */
  async atualizarSqliteFromFirebird(dominio: string, dto: CompararDto) {
    const tabelaFB = dto.tabelaFirebird ?? dominio.toUpperCase();
    const fbData   = await this.firebird.query(`SELECT * FROM ${tabelaFB}`);

    let atualizados = 0;
    const erros: any[] = [];

    for (const reg of fbData) {
      try {
        // Estratégia de UPSERT genérica no SQLite
        const campos  = Object.keys(reg);
        const valores = Object.values(reg);
        const placeholders = campos.map(() => '?').join(', ');
        const updates = campos.map(c => `${c} = excluded.${c}`).join(', ');

        this.sqlite.run(
          `INSERT INTO ${dominio} (${campos.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT(id) DO UPDATE SET ${updates}`,
          valores
        );
        atualizados++;
      } catch (err) {
        erros.push({ id: reg.id ?? '?', erro: err.message });
      }
    }

    this.logger.info(`SQLite atualizado do Firebird (${dominio}): ${atualizados}/${fbData.length}`);

    return { atualizados, total: fbData.length, erros: erros.length, detalhes_erros: erros };
  }

  // ─── Helpers privados ───────────────────────────────────────────────────────

  /**
   * UPSERT no Firebird 2.5 usando sintaxe nativa UPDATE OR INSERT.
   * Remove campos de controle SQLite antes de enviar.
   */
  private async upsertFirebird(tabela: string, registro: any) {
    // Exclui colunas de controle que não existem no Firebird
    const { status, retorno, created_at, updated_at, ...dados } = registro;

    const campos  = Object.keys(dados);
    const valores = Object.values(dados);

    if (campos.length === 0) return;

    // UPDATE OR INSERT é a sintaxe oficial do Firebird 2.5 para UPSERT
    const sql = `
      UPDATE OR INSERT INTO ${tabela}
        (${campos.join(', ')})
      VALUES
        (${campos.map(() => '?').join(', ')})
      MATCHING (ID)
    `;

    await this.firebird.query(sql, valores);
  }
}
