// backend/src/routes/api-proxy.js

'use strict';

const express = require('express');
const router  = express.Router();

/** Métodos HTTP que NÃO carregam body */
const BODYLESS_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Códigos de erro de rede que indicam host inacessível */
const NETWORK_ERROR_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET']);

// HELPERS PRIVADOS

/**
 * Extrai e valida os headers obrigatórios da requisição.
 *
 * @param {import('express').Request} req
 * @returns {{ ok: true, apiUrl: string, apiKey: string }
 *           | { ok: false, status: number, body: object }}
 */
function _extractHeaders(req) {
    const apiUrl = (req.headers['x-api-url'] || '').trim();
    const apiKey = (req.headers['x-api-key'] || '').trim();

    if (!apiUrl || !apiKey) {
        return {
            ok: false,
            status: 400,
            body: {
                error:   'Headers obrigatórios ausentes',
                details: 'x-api-url e x-api-key devem ser enviados em toda requisição',
                missing: {
                    'x-api-url': !apiUrl,
                    'x-api-key': !apiKey
                }
            }
        };
    }

    return { ok: true, apiUrl, apiKey };
}

/**
 * Monta a URL completa de destino, preservando query string.
 *
 * @param {string} apiUrl    - Base URL da API externa (sem trailing slash)
 * @param {string} pathParam - Segmento de caminho extraído da rota (req.params[0])
 * @param {string} reqUrl    - URL original da requisição (para extrair query string)
 * @returns {string}
 */
function _buildTargetUrl(apiUrl, pathParam, reqUrl) {
    const base        = apiUrl.replace(/\/$/, '');
    const queryIndex  = reqUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? reqUrl.substring(queryIndex) : '';

    return `${base}/${pathParam}${queryString}`;
}

/**
 * Tenta parsear o body de uma resposta de erro.
 * Retorna objeto mesmo quando o body não for JSON válido.
 *
 * @param {Response} response - Resposta Fetch
 * @returns {Promise<object>}
 */
async function _parseErrorBody(response) {
    try {
        return await response.json();
    } catch {
        return { message: response.statusText || 'Erro desconhecido' };
    }
}

/**
 * Classifica erros de rede e retorna payload padronizado.
 *
 * @param {Error}  error    - Erro capturado no catch
 * @param {string} fullUrl  - URL que foi chamada
 * @returns {{ status: number, body: object }}
 */
function _classifyNetworkError(error, fullUrl) {
    const isNetworkFailure =
        NETWORK_ERROR_CODES.has(error.code) ||
        error.message.includes('fetch failed');

    if (isNetworkFailure) {
        return {
            status: 503,
            body: {
                error:         'API externa inacessível',
                details:       'Verifique se a URL da API está correta e se o servidor está no ar',
                targetUrl:     fullUrl,
                originalError: error.message
            }
        };
    }

    return {
        status: 500,
        body: {
            error:     'Erro interno no proxy',
            details:   error.message,
            targetUrl: fullUrl,
            stack:     process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
    };
}

// MIDDLEWARE DE LOG DE REQUISIÇÃO


/**
 * Loga todas as requisições que passam pelo proxy.
 * Não bloqueia — apenas registra e chama next().
 */
function proxyLogger(req, _res, next) {
    const apiUrl = (req.headers['x-api-url'] || '').trim();
    console.log(`🔄 [PROXY] ${req.method} → ${apiUrl}/${req.params[0] || ''}`);
    next();
}

// HANDLER PRINCIPAL

/**
 * Proxy transparente para a API Varejo Fácil.
 *
 * Fluxo:
 *   1. Valida headers obrigatórios
 *   2. Monta URL de destino com query string
 *   3. Encaminha requisição (método + body quando aplicável)
 *   4. Repassa status e body da API externa
 *   5. Trata erros HTTP e de rede de forma granular
 */
async function proxyHandler(req, res) {
    // 1. Validar headers
    const headers = _extractHeaders(req);
    if (!headers.ok) {
        console.error('❌ [PROXY] Headers inválidos:', headers.body.missing);
        return res.status(headers.status).json(headers.body);
    }

    const { apiUrl, apiKey } = headers;
    const pathParam = req.params[0] || '';
    const fullUrl   = _buildTargetUrl(apiUrl, pathParam, req.url);

    try {
        // 2. Realizar requisição à API externa
        const fetchOptions = {
            method:  req.method,
            headers: {
                'x-api-key':    apiKey,
                'Content-Type': 'application/json',
                'Accept':       'application/json'
            }
        };

        // Incluir body apenas para métodos que o suportam
        if (!BODYLESS_METHODS.has(req.method.toUpperCase())) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(fullUrl, fetchOptions);

        console.log(`📥 [PROXY] ${response.status} ${response.statusText} ← ${fullUrl}`);

        // 3. Tratar resposta de erro da API externa
        if (!response.ok) {
            const errorBody = await _parseErrorBody(response);
            console.error(`❌ [PROXY] API retornou ${response.status}:`, errorBody);

            return res.status(response.status).json({
                error:     `API retornou erro ${response.status}`,
                details:   errorBody,
                targetUrl: fullUrl
            });
        }

        // 4. Repassar resposta de sucesso
        const data = await response.json();
        console.log(`✅ [PROXY] Sucesso → ${req.method} ${fullUrl}`);

        return res.status(response.status).json(data);

    } catch (error) {
        // 5. Tratar erros de rede / timeout / parse
        console.error('❌ [PROXY] Erro ao encaminhar requisição:', error.message);

        const { status, body } = _classifyNetworkError(error, fullUrl);
        return res.status(status).json(body);
    }
}

// REGISTRO DAS ROTAS

// Captura qualquer método HTTP em qualquer path após o prefixo de montagem
// O server.js deve montar este router em '/api/vf'
// Resultado: todas as chamadas /api/vf/* chegam aqui como /*
router.all('/*', proxyLogger, proxyHandler);

module.exports = router;