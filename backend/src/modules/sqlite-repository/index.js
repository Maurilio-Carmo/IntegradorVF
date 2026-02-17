// backend/src/modules/sqlite-repository/index.js

/**
 * Ponto de entrada do módulo sqlite-repository.
 * Exporta todos os repositórios organizados por domínio.
 */

const Mercadologia = require('./repositories/mercadologia.js');
const Produto      = require('./repositories/produto.js');
const Financeiro   = require('./repositories/financeiro.js');
const FrenteLoja   = require('./repositories/frente-loja.js');
const Estoque      = require('./repositories/estoque.js');
const Fiscal       = require('./repositories/fiscal.js');
const Pessoa       = require('./repositories/pessoa.js');

module.exports = {
    Mercadologia,
    Produto,
    FrenteLoja,
    Financeiro,
    Estoque,
    Fiscal,
    Pessoa,
};