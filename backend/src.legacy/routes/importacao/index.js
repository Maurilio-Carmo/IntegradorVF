'use strict';

const express = require('express');
const router  = express.Router();

// Cada sub-domínio é montado no mesmo prefixo vazio
// porque os paths já são específicos dentro de cada módulo.
router.use('/', require('./produto'));
router.use('/', require('./financeiro'));
router.use('/', require('./pdv'));
router.use('/', require('./estoque'));
router.use('/', require('./fiscal'));
router.use('/', require('./pessoa'));
router.use('/', require('./utils'));

module.exports = router;