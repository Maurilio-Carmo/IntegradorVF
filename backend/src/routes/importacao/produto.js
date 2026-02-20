'use strict';

const express = require('express');
const router  = express.Router();
const ImportacaoService = require('../../services/importacao-service');
const { extrairData } = require('./helpers');

// POST /api/importacao/importar-mercadologia
router.post('/importar-mercadologia', async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return res.status(400).json({
                error: 'Body inválido: esperado { data: { secoes, grupos, subgrupos } }',
            });
        }

        const { secoes = [], grupos = [], subgrupos = [] } = data;

        const [rSecoes, rGrupos, rSubgrupos] = await Promise.all([
            ImportacaoService.importarSecoes(secoes),
            ImportacaoService.importarGrupos(grupos),
            ImportacaoService.importarSubgrupos(subgrupos),
        ]);

        res.json({ success: true, secoes: rSecoes, grupos: rGrupos, subgrupos: rSubgrupos });
    } catch (error) {
        console.error('[importar-mercadologia]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/importacao/importar-marcas
router.post('/importar-marcas', async (req, res) => {
    try {
        const data = extrairData(req, res); if (!data) return;
        res.json(await ImportacaoService.importarMarcas(data));
    } catch (error) {
        console.error('[importar-marcas]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/importacao/importar-familias
router.post('/importar-familias', async (req, res) => {
    try {
        const data = extrairData(req, res); if (!data) return;
        res.json(await ImportacaoService.importarFamilias(data));
    } catch (error) {
        console.error('[importar-familias]', error.message);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/importacao/importar-produtos
router.post('/importar-produtos', async (req, res) => {
    try {
        const data = extrairData(req, res); if (!data) return;
        const lojaId = req.body.lojaId ?? null;
        res.json(await ImportacaoService.importarProdutos(data, lojaId));
    } catch (error) {
        console.error('[importar-produtos]', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;