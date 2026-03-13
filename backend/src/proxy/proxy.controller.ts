// backend/src/proxy/proxy.controller.ts
import { All, Controller, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

/**
 * Proxy transparente — repassa qualquer método/path para a API Varejo Fácil.
 * Requer headers:
 *   x-api-url  → URL base da API (ex: https://api.varejofa.com)
 *   x-api-key  → token de autenticação
 *
 * Exemplo: GET /api/vf/administracao/licenciamento
 *       →  GET https://api.varejofa.com/api/v1/administracao/licenciamento
 */
@ApiTags('Proxy API Varejo Fácil')
@Controller('api/vf')
export class ProxyController {
  private readonly log = new Logger(ProxyController.name);
  private static readonly CONTROLLER_PREFIX = '/api/vf/';

  @All('*path')
  @ApiOperation({ summary: 'Proxy transparente → API Varejo Fácil' })
  @ApiHeader({ name: 'x-api-url', required: true, description: 'URL base da API VF' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'Token de autenticação' })
  async proxy(@Req() req: Request, @Res() res: Response) {
    const apiUrl = (req.headers['x-api-url'] as string ?? '').trim();
    const apiKey = (req.headers['x-api-key'] as string ?? '').trim();

    // Valida headers obrigatórios
    if (!apiUrl || !apiKey) {
      return res.status(400).json({
        error:   'Headers obrigatórios ausentes',
        missing: { 'x-api-url': !apiUrl, 'x-api-key': !apiKey },
      });
    }

    const withoutPrefix = req.url.startsWith(ProxyController.CONTROLLER_PREFIX)
      ? req.url.slice(ProxyController.CONTROLLER_PREFIX.length)
      : req.url.replace(/^\//, '');

    const fullUrl = `${apiUrl.replace(/\/$/, '')}/${withoutPrefix}`;

    try {
      const opts: RequestInit = {
        method:  req.method,
        headers: {
          'x-api-key':    apiKey,
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
      };

      // Inclui body apenas para métodos que o suportam
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        opts.body = JSON.stringify(req.body);
      }

      const upstream = await fetch(fullUrl, opts);
      this.log.log(`${upstream.status} ← ${req.method} ${fullUrl}`);

      const data = await upstream.json().catch(() => ({}));
      return res.status(upstream.status).json(data);

    } catch (err) {
      this.log.error(`Proxy error: ${err.message}`);
      return res.status(502).json({
        error:  'Falha ao conectar à API externa',
        detail: err.message,
      });
    }
  }
}