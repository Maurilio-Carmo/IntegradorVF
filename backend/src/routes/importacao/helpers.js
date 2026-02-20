'use strict';

const ImportacaoService = require('../../services/importacao-service');

/**
 * Extrai e valida o array 'data' do body.
 * Retorna null e envia 400 se inválido.
 */
function extrairData(req, res) {
    const { data } = req.body;

    if (!Array.isArray(data)) {
        res.status(400).json({
            error: 'Body inválido: esperado { data: Array }',
            recebido: typeof data,
        });
        return null;
    }

    return data;
}

/**
 * Factory que gera handlers padronizados para rotas simples:
 *   POST body { data: [...] } → ImportacaoService[methodName](data)
 *
 * @param {string} methodName - Nome do método no ImportacaoService
 * @returns {Function} Express async route handler
 */
function wrapRoute(methodName) {
    return async (req, res) => {
        try {
            const data = extrairData(req, res);
            if (!data) return;
            res.json(await ImportacaoService[methodName](data));
        } catch (error) {
            console.error(`[${methodName}]`, error.message);
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = { extrairData, wrapRoute };