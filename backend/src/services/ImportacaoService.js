// backend/src/services/ImportacaoService.js

const dbSQLite = require('../config/database-sqlite');

class ImportacaoService {
    /**
     * Importar seções
     */
    static async importarSecoes(secoes) {
        try {
            console.log(`📥 Importando ${secoes.length} seções...`);

            // Garantir conexão
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO secoes (
                        secao_id_old, descricao_old, status,
                        secao_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const secao of secoes) {
                    stmt.run(
                        secao.id?.toString() || null,
                        secao.descricao || null,
                        '♻️',
                        parseInt(secao.id) || null,
                        secao.descricao || null
                    );
                }
            });

            transaction();
            console.log(`✅ ${secoes.length} seções importadas`);
            
            return { success: true, count: secoes.length };
        } catch (error) {
            console.error('❌ Erro ao importar seções:', error);
            throw error;
        }
    }

    /**
     * Importar grupos
     */
    static async importarGrupos(grupos) {
        try {
            console.log(`📥 Importando ${grupos.length} grupos...`);

            // Garantir conexão
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO grupos (
                        secao_id_old, grupo_id_old, descricao_old, status,
                        secao_id_new, grupo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const grupo of grupos) {
                    stmt.run(
                        grupo.secaoId?.toString() || null,
                        grupo.id?.toString() || null,
                        grupo.descricao || null,
                        '♻️',
                        parseInt(grupo.secaoId) || null,
                        parseInt(grupo.id) || null,
                        grupo.descricao || null
                    );
                }
            });

            transaction();
            console.log(`✅ ${grupos.length} grupos importados`);
            
            return { success: true, count: grupos.length };
        } catch (error) {
            console.error('❌ Erro ao importar grupos:', error);
            throw error;
        }
    }

    /**
     * Importar subgrupos
     */
    static async importarSubgrupos(subgrupos) {
        try {
            console.log(`📥 Importando ${subgrupos.length} subgrupos...`);

            // Garantir conexão
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO subgrupos (
                        secao_id_old, grupo_id_old, subgrupo_id_old, descricao_old, status,
                        secao_id_new, grupo_id_new, subgrupo_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const subgrupo of subgrupos) {
                    stmt.run(
                        subgrupo.secaoId?.toString() || null,
                        subgrupo.grupoId?.toString() || null,
                        subgrupo.id?.toString() || null,
                        subgrupo.descricao || null,
                        '♻️',
                        parseInt(subgrupo.secaoId) || null,
                        parseInt(subgrupo.grupoId) || null,
                        parseInt(subgrupo.id) || null,
                        subgrupo.descricao || null
                    );
                }
            });

            transaction();
            console.log(`✅ ${subgrupos.length} subgrupos importados`);
            
            return { success: true, count: subgrupos.length };
        } catch (error) {
            console.error('❌ Erro ao importar subgrupos:', error);
            throw error;
        }
    }

    /**
     * Importar marcas
     */
    static async importarMarcas(marcas) {
        try {
            console.log(`📥 Importando ${marcas.length} marcas...`);

            // Garantir conexão
            dbSQLite.getConnection();

            const transaction = dbSQLite.db.transaction(() => {
                const stmt = dbSQLite.db.prepare(`
                    INSERT OR REPLACE INTO marcas (
                        marca_id_old, descricao_old, status,
                        marca_id_new, descricao_new
                    ) VALUES (?, ?, ?, ?, ?)
                `);

                for (const marca of marcas) {
                    stmt.run(
                        marca.id?.toString() || null,
                        marca.descricao || null,
                        '♻️',
                        parseInt(marca.id) || null,
                        marca.descricao || null
                    );
                }
            });

            transaction();
            console.log(`✅ ${marcas.length} marcas importadas`);
            
            return { success: true, count: marcas.length };
        } catch (error) {
            console.error('❌ Erro ao importar marcas:', error);
            throw error;
        }
    }

    /**
     * Obter estatísticas do banco
     */
    static async obterEstatisticas() {
        try {
            // Garantir conexão
            dbSQLite.getConnection();

            const stats = {
                secoes: dbSQLite.count('secoes'),
                grupos: dbSQLite.count('grupos'),
                subgrupos: dbSQLite.count('subgrupos'),
                marcas: dbSQLite.count('marcas'),
                produtos: dbSQLite.count('produtos'),
                clientes: dbSQLite.count('clientes'),
                fornecedores: dbSQLite.count('fornecedores')
            };

            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                secoes: 0,
                grupos: 0,
                subgrupos: 0,
                marcas: 0,
                produtos: 0,
                clientes: 0,
                fornecedores: 0
            };
        }
    }
}

module.exports = ImportacaoService;