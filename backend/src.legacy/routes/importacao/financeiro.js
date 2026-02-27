'use strict';

const express = require('express');
const router  = express.Router();
const ImportacaoService = require('../../services/importacao-service');
const { extrairData, wrapRoute } = require('./helpers');

router.post('/importar-categorias',       wrapRoute('importarCategorias'));
router.post('/importar-agentes',          wrapRoute('importarAgentes'));
router.post('/importar-contas-correntes', wrapRoute('importarContasCorrentes'));
router.post('/importar-especies-documento', wrapRoute('importarEspeciesDocumento'));
router.post('/importar-historico-padrao', wrapRoute('importarHistoricoPadrao'));

// wrapRoute é um factory — veja _helpers.js abaixo
module.exports = router;