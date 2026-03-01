// backend/src/firebird-sync/firebird-sync.service.ts
import { Injectable }        from '@nestjs/common';
import { SqliteService }     from '../database/sqlite.service';
import { FirebirdService }   from '../database/firebird.service';
import { ComparatorService, CompareResult } from '../comparator/comparator.service';
import { AppLoggerService }  from '../logger/logger.service';
import { CompararDto }       from './dto/comparar.dto';

/**
 * Sincronização bidirecional entre SQLite e Firebird 2.5.
 *
 * Direções disponíveis:
 *   SQLite  → Firebird : migrarParaFirebird()        (UPDATE OR INSERT nativo do FB 2.5)
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

  /** Testa a conectividade com o Firebird — CORREÇÃO: chama testConnection() que agora existe */
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
  async comparar(dominio: string, dto: CompararDto): Promise<CompareResult> {
    const tabelaFB     = dto.tabelaFirebird ?? dominio.toUpperCase();
    const sqliteData   = this.sqlite.query(`SELECT * FROM ${dominio}`);
    const firebirdData = await this.firebird.query(`SELECT * FROM ${tabelaFB}`);

    return this.comparator.compare(sqliteData, firebirdData, {
      keyField:      dto.campoChave     ?? 'id',
      compareFields: dto.camposComparar ?? [],
    });
  }

  /**
   * Migra todos os registros do SQLite para o Firebird.
   * Usa UPDATE OR INSERT (Firebird 2.5 nativo) — idempotente.
   */
  async migrarParaFirebird(dominio: string) {
    const registros = this.sqlite.query(`SELECT * FROM ${dominio}`);
    const tabela    = dominio.toUpperCase();
    let migrados    = 0;
    const erros: any[] = [];

    for (const reg of registros as any[]) {
      try {
        await this.upsertFirebird(tabela, reg);
        migrados++;
      } catch (err: any) {
        erros.push({ id: reg.id, erro: err.message });
        this.logger.error(`Falha ao migrar ${tabela}[${reg.id}]: ${err.message}`, 'FirebirdSync');
      }
    }

    // CORREÇÃO: success() agora existe no AppLoggerService
    this.logger.success(
      `Migração ${tabela}: ${migrados}/${registros.length}`,
      'FirebirdSync',
      { erros: erros.length },
    );

    return {
      migrados,
      total:          registros.length,
      erros:          erros.length,
      detalhes_erros: erros,
    };
  }

  /**
   * Sobrescreve o SQLite com dados do Firebird (sentido inverso).
   */
  async atualizarSqliteFromFirebird(dominio: string, dto: CompararDto) {
    const tabelaFB = dto.tabelaFirebird ?? dominio.toUpperCase();
    const registros = await this.firebird.query(`SELECT * FROM ${tabelaFB}`);
    let atualizados = 0;

    for (const reg of registros as any[]) {
      try {
        const colunas = Object.keys(reg);
        const valores = Object.values(reg);
        const placeholders = colunas.map(() => '?').join(', ');
        const updates      = colunas.map(c => `${c} = ?`).join(', ');
        const chave        = dto.campoChave ?? 'id';

        // Tenta UPDATE primeiro, depois INSERT
        const resultado = this.sqlite.run(
          `UPDATE ${dominio} SET ${updates} WHERE ${chave} = ?`,
          [...valores, reg[chave]]
        );

        if (resultado.changes === 0) {
          this.sqlite.run(
            `INSERT INTO ${dominio} (${colunas.join(', ')}) VALUES (${placeholders})`,
            valores
          );
        }

        atualizados++;
      } catch (err: any) {
        this.logger.error(`Falha upsert ${dominio}: ${err.message}`, 'FirebirdSync');
      }
    }

    this.logger.success(
      `SQLite atualizado a partir do Firebird: ${atualizados} registros`,
      'FirebirdSync',
    );

    return { dominio, atualizados, total: registros.length };
  }

  // ─── privado ────────────────────────────────────────────────────────────────

  /**
   * Executa UPDATE OR INSERT no Firebird 2.5.
   * Sintaxe nativa: UPDATE OR INSERT INTO tabela (cols) VALUES (...) MATCHING (id)
   */
  private async upsertFirebird(tabela: string, registro: any): Promise<void> {
    const colunas      = Object.keys(registro);
    const valores      = Object.values(registro);
    const placeholders = colunas.map(() => '?').join(', ');

    const sql = `
      UPDATE OR INSERT INTO ${tabela} (${colunas.join(', ')})
      VALUES (${placeholders})
      MATCHING (ID)
    `;

    await this.firebird.execute(sql, valores);
  }
}