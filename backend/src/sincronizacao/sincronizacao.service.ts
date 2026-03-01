// backend/src/sincronizacao/sincronizacao.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { SqliteService }    from '../database/sqlite.service';
import { AppLoggerService } from '../logger/logger.service';
import { DOMINIOS_VALIDOS } from './dto/executar-sync.dto';

interface ApiConfig { apiUrl: string; apiKey: string; }

const DOMINIOS_SET = new Set(DOMINIOS_VALIDOS);

/**
 * Motor de sincronização entre SQLite e a API Varejo Fácil.
 *
 * Status dos registros:
 *   C → POST   (criar na API)
 *   U → PUT    (atualizar na API)
 *   D → DELETE (remover na API)
 *   S → Sincronizado com sucesso
 *   E → Erro — disponível para reprocessamento
 */
@Injectable()
export class SincronizacaoService {

  constructor(
    private readonly sqlite: SqliteService,
    private readonly logger: AppLoggerService,
  ) {}

  /** Lista registros com status pendente (C, U ou D) */
  listarPendentes(dominio: string) {
    this.validarDominio(dominio);
    const registros = this.sqlite.query(
      `SELECT * FROM ${dominio} WHERE status IN ('C','U','D') ORDER BY updated_at`
    );
    return { dominio, total: registros.length, registros };
  }

  /** Sincroniza todos os pendentes de um domínio com a API */
  async executarSincronizacao(dominio: string, apiConfig: ApiConfig) {
    this.validarDominio(dominio);
    this.validarApiConfig(apiConfig);

    const inicio    = Date.now();
    const pendentes = this.sqlite.query(
      `SELECT * FROM ${dominio} WHERE status IN ('C','U','D') ORDER BY updated_at`
    );

    this.logger.info(
      `Sync ${dominio}: ${pendentes.length} registros pendentes`,
      'Sincronizacao',
    );

    const resultado = {
      criados:     0,
      atualizados: 0,
      deletados:   0,
      erros:       0,
      total:       pendentes.length,
    };

    for (const registro of pendentes as any[]) {
      await this.processarRegistro(dominio, registro, apiConfig, resultado);
    }

    const duracao = Date.now() - inicio;
    this.salvarHistorico(dominio, resultado, duracao);

    // CORREÇÃO: success() agora existe no AppLoggerService
    this.logger.success(
      `Sync ${dominio} concluído em ${duracao}ms`,
      'Sincronizacao',
      resultado,
    );

    return { ...resultado, duracao_ms: duracao, dominio };
  }

  /** Reprocessa um único registro com status E */
  async reprocessarRegistro(dominio: string, id: string, apiConfig: ApiConfig) {
    this.validarDominio(dominio);
    this.validarApiConfig(apiConfig);

    const registro = this.sqlite.get(
      `SELECT * FROM ${dominio} WHERE id = ? AND status = 'E'`,
      [id]
    );

    if (!registro) {
      throw new BadRequestException(
        `Registro ${id} não encontrado com status E no domínio ${dominio}`
      );
    }

    const resultado = { criados: 0, atualizados: 0, deletados: 0, erros: 0, total: 1 };
    const reg = { ...(registro as any), status: 'U' };
    await this.processarRegistro(dominio, reg, apiConfig, resultado);

    return resultado;
  }

  /** Retorna as últimas 50 execuções de sync */
  obterHistorico() {
    return this.sqlite.query(
      `SELECT * FROM sync_historico ORDER BY executado_em DESC LIMIT 50`
    );
  }

  // ─── Métodos privados ───────────────────────────────────────────────────────

  private async processarRegistro(
    dominio:   string,
    registro:  any,
    apiConfig: ApiConfig,
    resultado: any,
  ) {
    const { id, status } = registro;
    const baseUrl = `${apiConfig.apiUrl.replace(/\/$/, '')}/${dominio}`;

    try {
      const payload = this.extrairPayload(registro);

      if (status === 'C') {
        await this.httpCall('POST',   baseUrl,            apiConfig.apiKey, payload);
        resultado.criados++;
      } else if (status === 'U') {
        await this.httpCall('PUT',    `${baseUrl}/${id}`, apiConfig.apiKey, payload);
        resultado.atualizados++;
      } else if (status === 'D') {
        await this.httpCall('DELETE', `${baseUrl}/${id}`, apiConfig.apiKey);
        resultado.deletados++;
      }

      this.marcarStatus(dominio, id, 'S', JSON.stringify({ ok: true }));

    } catch (err: any) {
      this.logger.error(`Falha ${dominio}[${id}]: ${err.message}`, 'Sincronizacao');
      this.marcarStatus(dominio, id, 'E', err.message);
      resultado.erros++;
    }
  }

  private extrairPayload(registro: any): any {
    const { status, retorno, created_at, updated_at, _rowid_, ...payload } = registro;
    return payload;
  }

  private marcarStatus(dominio: string, id: any, status: string, retorno: string) {
    this.sqlite.run(
      `UPDATE ${dominio}
       SET    status = ?, retorno = ?, updated_at = datetime('now')
       WHERE  id = ?`,
      [status, retorno, id]
    );
  }

  private salvarHistorico(dominio: string, resultado: any, duracaoMs: number) {
    try {
      this.sqlite.run(
        `INSERT INTO sync_historico (dominio, resultado, duracao_ms) VALUES (?, ?, ?)`,
        [dominio, JSON.stringify(resultado), duracaoMs]
      );
    } catch { /* sync_historico pode não existir ainda */ }
  }

  private async httpCall(method: string, url: string, apiKey: string, body?: any) {
    const res = await fetch(url, {
      method,
      headers: {
        'x-api-key':      apiKey,
        'Content-Type':   'application/json',
        'Accept':         'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    return res.json().catch(() => ({}));
  }

  private validarDominio(dominio: string) {
    if (!DOMINIOS_SET.has(dominio as typeof DOMINIOS_VALIDOS[number])) {
      throw new BadRequestException(`Domínio inválido: "${dominio}"`);
    }
  }

  private validarApiConfig(config: ApiConfig) {
    if (!config?.apiUrl || !config?.apiKey) {
      throw new BadRequestException('Headers x-api-url e x-api-key são obrigatórios');
    }
  }
}