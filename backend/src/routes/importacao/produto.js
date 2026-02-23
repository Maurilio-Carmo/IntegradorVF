'use strict';

const express = require('express');
const router  = express.Router();
const ImportacaoService = require('../../services/importacao-service');
const { extrairData, wrapRoute } = require('./helpers');

router.post('/importar-secoes',                 wrapRoute('importarSecoes'));
router.post('/importar-grupos',                 wrapRoute('importarGrupos'));
router.post('/importar-subgrupos',              wrapRoute('importarSubgrupos'));
router.post('/importar-marcas',                 wrapRoute('importarMarcas'));
router.post('/importar-familias',               wrapRoute('importarFamilias'));
router.post('/importar-produto-auxiliares',     wrapRoute('importarProdutoAuxiliares'));
router.post('/importar-produto-fornecedores',   wrapRoute('importarProdutoFornecedores'));

// POST /api/importacao/importar-produtos
router.post('/importar-produtos', async (req, res) => {
    try {
        const data = extrairData(req, res);
        if (!data) return;
        const lojaId = req.body.lojaId ?? null;
        res.json(await ImportacaoService.importarProdutos(data, lojaId));
    } catch (error) {
        console.error('[importar-produtos]', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/produto-ids', (req, res) => {
    try {
        const dbSQLite = require('../../config/database-sqlite');
        const rows = dbSQLite.query(
            `SELECT produto_id FROM produtos WHERE status NOT IN ('C') ORDER BY produto_id`
        );
        const ids = rows.map(r => r.produto_id);
        res.json({ ids, total: ids.length });
    } catch (error) {
        console.error('[produto-ids]', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;