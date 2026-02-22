// scripts/reset-db.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '..', 'backend', 'database', 'IntegradorVF.db');

if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️  Banco de dados removido.');
} else {
    console.log('ℹ️  Banco de dados não encontrado, nada a remover.');
}

console.log('🔄 Recriando banco de dados...');
execSync('node backend/check-database.js', { stdio: 'inherit' });