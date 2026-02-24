'use strict';

const express = require('express');
const router  = express.Router();
const { wrapRoute } = require('./helpers');

router.post('/importar-regime-tributario',           wrapRoute('importarRegimeTributario'));
router.post('/importar-situacoes-fiscais',           wrapRoute('importarSituacoesFiscais'));
router.post('/importar-tipos-operacoes',             wrapRoute('importarTiposOperacoes'));
router.post('/importar-impostos-federais',           wrapRoute('importarImpostosFederais'));
router.post('/importar-tabelas-tributarias',         wrapRoute('importarTabelasTributarias'));

module.exports = router;