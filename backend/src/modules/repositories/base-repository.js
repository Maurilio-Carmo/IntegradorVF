// backend/src/modules/sqlite-repository/base-repository.js

const dbSQLite = require('../../config/database-sqlite');

/**
 * BaseRepository
 * Centraliza a lógica de transação e upsert para eliminar duplicidade.
 * Cada repositório filho define apenas o SQL e o mapeamento de campos.
 */

class BaseRepository {

    /**
     * Executa uma lista de itens dentro de uma transação atômica.
     * @param {string}   entidade  - Nome legível (para logs)
     * @param {Array}    items     - Array de objetos vindos da API
     * @param {Function} buildStmt - Função que recebe db e retorna prepared statement
     * @param {Function} mapItem   - Função que mapeia um item para array de valores do stmt
     * @returns {{ success: boolean, count: number }}
     */
    static _executarTransacao(entidade, items, buildStmt, mapItem) {
        if (!items || items.length === 0) {
            return { success: true, count: 0 };
        }

        try {
            console.log(`📥 Importando ${items.length} ${entidade}...`);
            dbSQLite.getConnection();

            const stmt = buildStmt(dbSQLite.db);

            const transaction = dbSQLite.db.transaction(() => {
                for (const item of items) {
                    stmt.run(...mapItem(item));
                }
            });

            transaction();
            console.log(`✅ ${items.length} ${entidade} importados`);
            return { success: true, count: items.length };

        } catch (error) {
            console.error(`❌ Erro ao importar ${entidade}:`, error.message);
            throw error;
        }
    }

    /**
     * Helpers de conversão para respeitar os tipos do schema SQLite
     */
    static _bool(val)  { return val ? 1 : 0; }
    static _str(val)   { return val != null ? String(val) : null; }
    static _num(val)   { return val != null ? Number(val)  : null; }
    static _date(val)  { return val ? val.split('T')[0] : null; }
    static _ids(arr)   { return Array.isArray(arr) ? arr.map(i => i.id ?? i).join(';') : null; }
    static _cep(val)   { return val ? String(val).replace(/\D/g, '') : null;}
    static _int(val)   { const n = parseInt(val, 10); return n > 0 ? n : null; }
}

module.exports = BaseRepository;