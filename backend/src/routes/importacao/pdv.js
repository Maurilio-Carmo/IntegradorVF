'use strict';

const express = require('express');
const router  = express.Router();
const { wrapRoute } = require('./helpers');

router.post('/importar-formas-pagamento',       wrapRoute('importarFormasPagamento'));
router.post('/importar-pagamentos-pdv',         wrapRoute('importarPagamentosPDV'));
router.post('/importar-recebimentos-pdv',       wrapRoute('importarRecebimentosPDV'));
router.post('/importar-motivos-desconto',       wrapRoute('importarMotivosDesconto'));
router.post('/importar-motivos-devolucao',      wrapRoute('importarMotivosDevolucao'));
router.post('/importar-motivos-cancelamento',   wrapRoute('importarMotivosCancelamento'));

module.exports = router;