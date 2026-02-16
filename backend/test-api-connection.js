// test-api-connection.js
// Script para testar conexão direta com API Varejo Fácil

require('dotenv').config();

// Configure suas credenciais aqui ou via .env
const API_URL = process.env.VF_API_URL || 'https://api.varejofacil.com';
const API_KEY = process.env.VF_API_KEY || 'SUA_CHAVE_AQUI';

console.log('🔍 Teste de Conexão API Varejo Fácil\n');
console.log('📍 URL Base:', API_URL);
console.log('🔑 API Key:', API_KEY.substring(0, 10) + '...\n');

async function testarConexao() {
    const endpoint = `${API_URL}/api/v1/administracao/licenciamento`;
    
    console.log(`🌐 Testando: ${endpoint}\n`);

    try {
        console.log('⏳ Fazendo requisição...');
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log(`\n📥 Status: ${response.status} ${response.statusText}`);
        console.log('📋 Headers de resposta:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`   ${key}: ${value}`);
        }

        if (!response.ok) {
            console.log('\n❌ ERRO: API retornou status de erro\n');
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                console.log('📄 Dados do erro:');
                console.log(JSON.stringify(errorData, null, 2));
            } else {
                const errorText = await response.text();
                console.log('📄 Texto do erro:');
                console.log(errorText);
            }
            
            console.log('\n💡 Possíveis causas:');
            if (response.status === 401 || response.status === 403) {
                console.log('   - Chave de API inválida ou expirada');
                console.log('   - Permissões insuficientes');
            } else if (response.status === 404) {
                console.log('   - Endpoint não encontrado');
                console.log('   - URL base incorreta');
            } else if (response.status === 500) {
                console.log('   - Erro no servidor da API Varejo Fácil');
                console.log('   - Dados inválidos na requisição');
            }
            
            return;
        }

        const data = await response.json();
        
        console.log('\n✅ SUCESSO! Conexão estabelecida\n');
        console.log('📄 Dados recebidos:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.razaoSocial) {
            console.log(`\n🏢 Empresa: ${data.razaoSocial}`);
        }

    } catch (error) {
        console.log('\n❌ ERRO DE REDE\n');
        console.log('Tipo:', error.name);
        console.log('Mensagem:', error.message);
        
        console.log('\n💡 Possíveis causas:');
        console.log('   - Servidor não acessível (firewall/proxy)');
        console.log('   - URL incorreta');
        console.log('   - Problemas de DNS');
        console.log('   - Servidor da API offline');
        
        if (error.cause) {
            console.log('\nDetalhes técnicos:');
            console.log(error.cause);
        }
    }
}

// Executar teste
testarConexao()
    .then(() => {
        console.log('\n✅ Teste concluído');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erro inesperado:', error);
        process.exit(1);
    });

console.log('─'.repeat(70));
console.log('💡 DICA: Configure as variáveis de ambiente no arquivo .env:');
console.log('   VF_API_URL=https://api.varejofacil.com');
console.log('   VF_API_KEY=sua_chave_aqui');
console.log('─'.repeat(70) + '\n');