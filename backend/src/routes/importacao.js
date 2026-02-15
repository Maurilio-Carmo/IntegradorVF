// backend/src/routes/importacao.js

const express = require('express');
const router = express.Router();
const ImportacaoService = require('../services/ImportacaoService');

/**
 * POST /api/importacao/secoes
 * Importar seções para o banco
 */
router.post('/secoes', async (req, res) => {
    try {
        const { data } = req.body;
        const result = await ImportacaoService.importarSecoes(data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/grupos
 * Importar grupos para o banco
 */
router.post('/grupos', async (req, res) => {
    try {
        const { data } = req.body;
        const result = await ImportacaoService.importarGrupos(data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/subgrupos
 * Importar subgrupos para o banco
 */
router.post('/subgrupos', async (req, res) => {
    try {
        const { data } = req.body;
        const result = await ImportacaoService.importarSubgrupos(data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/importacao/marcas
 * Importar marcas para o banco
 */
router.post('/marcas', async (req, res) => {
    try {
        const { data } = req.body;
        const result = await ImportacaoService.importarMarcas(data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/importacao/estatisticas
 * Obter estatísticas do banco
 */
router.get('/estatisticas', async (req, res) => {
    try {
        const stats = await ImportacaoService.obterEstatisticas();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;