'use strict';

const express = require('express');
const router  = express.Router();
const { wrapRoute } = require('./helpers');

router.post('/importar-lojas',       wrapRoute('importarLojas'));
router.post('/importar-clientes',    wrapRoute('importarClientes'));
router.post('/importar-fornecedores',wrapRoute('importarFornecedores'));

module.exports = router;