'use strict';

const express = require('express');
const router  = express.Router();
const { wrapRoute } = require('./helpers');

router.post('/importar-local-estoque',      wrapRoute('importarLocalEstoque'));
router.post('/importar-tipos-ajustes',      wrapRoute('importarTiposAjustes'));
router.post('/importar-saldo-estoque',      wrapRoute('importarSaldoEstoque'));

module.exports = router;