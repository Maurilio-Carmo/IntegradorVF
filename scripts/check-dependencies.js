// scripts/check-dependencies.js
// Verifica se node_modules existe e instala automaticamente se necessário

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

console.log('🔍 Verificando dependências...');

function dependenciasInstaladas() {
    if (!fs.existsSync(nodeModulesPath)) return false;

    // Verifica se os pacotes críticos existem
    const criticos = ['better-sqlite3', 'node-firebird', 'express', 'dotenv', 'axios'];
    return criticos.every(pkg => 
        fs.existsSync(path.join(nodeModulesPath, pkg))
    );
}

function instalarDependencias() {
    console.log('📦 Instalando dependências automaticamente...');
    console.log('   (isso pode levar alguns minutos na primeira vez)\n');
    
    try {
        execSync('npm install', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log('\n✅ Dependências instaladas com sucesso!\n');
    } catch (error) {
        console.error('❌ Erro ao instalar dependências:', error.message);
        console.error('   Execute manualmente: npm install');
        process.exit(1); // Para a execução se falhar
    }
}

function verificarNodeFirebird() {
    // node-firebird exige client nativo do Firebird instalado no SO
    // Apenas avisa o usuário, não bloqueia
    try {
        require('node-firebird');
        console.log('✅ node-firebird OK');
    } catch (e) {
        console.warn('⚠️  node-firebird não carregou corretamente.');
        console.warn('   Certifique-se que o cliente Firebird está instalado no sistema:');
        console.warn('   Windows: https://firebirdsql.org/en/firebird-2-5/');
        console.warn('   Linux:   sudo apt install libfbclient2\n');
    }
}

// Fluxo principal
if (!dependenciasInstaladas()) {
    instalarDependencias();
} else {
    console.log('✅ Dependências já instaladas.\n');
}

verificarNodeFirebird();