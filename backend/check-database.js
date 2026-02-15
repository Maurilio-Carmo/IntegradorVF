// backend/check-database.js
// Script para verificar e inicializar o banco de dados

const dbSQLite = require('./src/config/database-sqlite');
const fs = require('fs');
const path = require('path');

async function checkAndInitDatabase() {
    try {
        console.log('🔍 Verificando banco de dados...');
        
        // Conectar ao banco
        const db = dbSQLite.connect();
        
        // Verificar se as tabelas existem
        const tables = dbSQLite.getTables();
        console.log(`📊 Tabelas existentes: ${tables.length}`);
        
        const requiredTables = ['secoes', 'grupos', 'subgrupos', 'marcas', 'produtos', 'clientes', 'fornecedores'];
        const missingTables = requiredTables.filter(t => !tables.includes(t));
        
        if (missingTables.length > 0) {
            console.log(`⚠️  Tabelas faltando: ${missingTables.join(', ')}`);
            console.log('🔧 Criando tabelas...');
            
            // Ler e executar o script SQL
            const sqlPath = path.join(__dirname, 'database/IntegradorDB.sql');
            
            if (!fs.existsSync(sqlPath)) {
                throw new Error(`Arquivo SQL não encontrado: ${sqlPath}`);
            }
            
            const sql = fs.readFileSync(sqlPath, 'utf8');
            
            // Executar o script
            db.exec(sql);
            
            console.log('✅ Tabelas criadas com sucesso!');
        } else {
            console.log('✅ Todas as tabelas necessárias existem');
        }
        
        // Mostrar informações do banco
        const info = dbSQLite.getInfo();
        console.log('\n📈 Informações do banco:');
        console.log(`   Total de tabelas: ${info.tables}`);
        console.log(`   Tamanho: ${dbSQLite.formatSize(info.size)}`);
        console.log('\n📊 Registros por tabela:');
        
        for (const [table, count] of Object.entries(info.details)) {
            console.log(`   ${table}: ${count} registros`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao verificar banco:', error);
        return false;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    checkAndInitDatabase()
        .then(success => {
            process.exit(success ? 0 : 1);
        });
}

module.exports = checkAndInitDatabase;