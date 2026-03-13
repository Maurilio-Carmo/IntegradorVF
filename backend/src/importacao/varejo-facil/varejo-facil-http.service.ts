// backend/src/importacao/varejo-facil/varejo-facil-http.service.ts
import { Injectable }       from '@nestjs/common';
import { CredencialVF }     from '../credenciais/credencial.service';
import { AppLoggerService }  from '../../logger/logger.service';

export type ApiConfig = CredencialVF;

export interface PagedResponse<T> {
  items:  T[];
  total:  number;
  offset: number;
}

@Injectable()
export class VarejoFacilHttpService {

  private readonly PAGE_SIZE   = 500;
  private readonly DELAY_MS    = 100;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  constructor(private readonly logger: AppLoggerService) {}

  async fetchPage<T = any>(
    config:   ApiConfig,
    endpoint: string,
    start     = 0,
    count     = this.PAGE_SIZE,
    sort      = 'id',
  ): Promise<PagedResponse<T>> {
    const base  = this._baseUrl(config.urlApi);         // ← sempre termina em /api/v1
    const url   = `${base}/${endpoint}?start=${start}&count=${count}&sort=${sort}`;
    const raw   = await this._fetch(url, config.tokenApi);
    const items: T[] = raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []);
    const total: number = raw.total ?? items.length;
    return { items, total, offset: start };
  }

  async fetchAll<T = any>(
    config:   ApiConfig,
    endpoint: string,
    onPage:   (items: T[], offset: number, total: number) => Promise<void>,
    sort      = 'id',
  ): Promise<number> {
    let offset         = 0;
    let totalConhecido = 0;
    let totalFetched   = 0;

    do {
      const page = await this.fetchPage<T>(config, endpoint, offset, this.PAGE_SIZE, sort);

      if (page.items.length === 0) break;
      if (page.total > 0) totalConhecido = page.total;

      await onPage(page.items, offset, totalConhecido);

      totalFetched += page.items.length;
      offset       += page.items.length;

      if (totalConhecido > 0 && totalFetched >= totalConhecido) break;
      if (page.items.length < this.PAGE_SIZE) break;

      await this._delay(this.DELAY_MS);
    } while (true);

    this.logger.info(`fetchAll [${endpoint}]: ${totalFetched} registros`, 'VarejoFacilHttp');
    return totalFetched;
  }

  async fetchFornecedoresProduto(config: ApiConfig, produtoId: number): Promise<any[]> {
    const base = this._baseUrl(config.urlApi);           // ← corrigido também aqui
    const url  = `${base}/produto/produtos/${produtoId}/fornecedores`;
    try {
      const raw = await this._fetch(url, config.tokenApi);
      return raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      if (err.message?.includes('404')) return [];
      throw err;
    }
  }

  // ─── Privado ──────────────────────────────────────────────────────────────

  /**
   * Normaliza a URL e GARANTE que termina em /api/v1.
   *
   * Exemplos:
   *   "https://superios.varejofacil.com"        → "https://superios.varejofacil.com/api/v1"
   *   "https://superios.varejofacil.com/"       → "https://superios.varejofacil.com/api/v1"
   *   "https://superios.varejofacil.com/api/v1" → "https://superios.varejofacil.com/api/v1"
   *
   * CORREÇÃO: o método anterior só removia /api/v1 sem recolocá-lo,
   * fazendo a URL ficar como https://superios.varejofacil.com/pessoa/lojas
   * em vez de https://superios.varejofacil.com/api/v1/pessoa/lojas.
   */
  private _baseUrl(urlApi: string): string {
    const clean = urlApi
      .trim()
      .replace(/\/$/, '')          // remove barra final
      .replace(/\/api\/v1$/, '');  // remove /api/v1 se já existir (evita duplicar)
    return `${clean}/api/v1`;      // sempre recoloca /api/v1
  }

  private async _fetch(url: string, tokenApi: string, attempt = 1): Promise<any> {
    try {
      const res = await fetch(url, {
        method:  'GET',
        headers: {
          'x-api-key':    tokenApi,
          'Accept':       'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const preview = (await res.text()).slice(0, 120);
        throw new Error(
          `A API retornou HTML em vez de JSON (${res.status}). ` +
          `Verifique se a URL está correta: ${url} — Preview: ${preview}`
        );
      }

      return await res.json();

    } catch (err: any) {
      const status = parseInt(err.message?.match(/HTTP (\d+)/)?.[1] ?? '0');
      const retryable = [408, 429, 500, 502, 503, 504];

      if (attempt < this.MAX_RETRIES && (retryable.includes(status) || status === 0)) {
        this.logger.info(
          `Retry ${attempt}/${this.MAX_RETRIES} — ${url}: ${err.message}`,
          'VarejoFacilHttp',
        );
        await this._delay(this.RETRY_DELAY * attempt);
        return this._fetch(url, tokenApi, attempt + 1);
      }

      throw err;
    }
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}