// backend/src/modules/sqlite-repository/index.js

/**
 * Ponto de entrada do módulo sqlite-repository.
 * Exporta todos os repositórios organizados por domínio.
 */

const Mercadologia = require('./mercadologia.js');
const Produto      = require('./produto.js');
const Financeiro   = require('./financeiro.js');
const FrenteLoja   = require('./frente-loja.js');
const Estoque      = require('./estoque.js');
const Fiscal       = require('./fiscal.js');
const Pessoa       = require('./pessoa.js');

module.exports = {
    Mercadologia,
    Produto,
    FrenteLoja,
    Financeiro,
    Estoque,
    Fiscal,
    Pessoa,
};