// backend/src/modules/sqlite-repository/index.js

/**
 * Ponto de entrada do módulo sqlite-repository.
 * Exporta todos os repositórios organizados por domínio.
 */

const Mercadologia = require('./sqllite/mercadologia.js');
const Produto      = require('./sqllite/produto.js');
const Financeiro   = require('./sqllite/financeiro.js');
const FrenteLoja   = require('./sqllite/frente-loja.js');
const Estoque      = require('./sqllite/estoque.js');
const Fiscal       = require('./sqllite/fiscal.js');
const Pessoa       = require('./sqllite/pessoa.js');

module.exports = {
    Mercadologia,
    Produto,
    FrenteLoja,
    Financeiro,
    Estoque,
    Fiscal,
    Pessoa,
};