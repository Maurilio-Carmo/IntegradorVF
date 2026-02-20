'use strict';

const express = require('express');
const router  = express.Router();
const ImportacaoService = require('../../services/importacao-service');

// GET /api/importacao/estatisticas
router.get('/estatisticas', async (req, res) => {
    try {
        const stats = await ImportacaoService.obterEstatisticas();
        res.json(stats);
    } catch (error) {
        console.error('[estatisticas]', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;