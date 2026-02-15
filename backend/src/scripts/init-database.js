// backend/src/scripts/init-database.js

const fs = require('fs');
const path = require('path');
const dbSQLite = require('../config/database-sqlite');

/**
 * Inicializar banco de dados SQLite
 */
async function initDatabase() {
    try {
        console.log('🔧 Iniciando criação do banco de dados...');

        // Conectar ao banco
        const db = dbSQLite.connect();

        // Ler o script SQL
        const sqlPath = path.join(__dirname, '../../database/IntegradorDB.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Executar o script
        db.exec(sql);

        console.log('✅ Banco de dados criado com sucesso!');
        console.log('📊 Tabelas criadas:', dbSQLite.getTables().join(', '));

        // Mostrar informações
        const info = dbSQLite.getInfo();
        console.log('\n📈 Informações do banco:');
        console.log(`   Total de tabelas: ${info.tables}`);
        console.log(`   Tamanho: ${dbSQLite.formatSize(info.size)}`);

        dbSQLite.close();
    } catch (error) {
        console.error('❌ Erro ao criar banco:', error);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;