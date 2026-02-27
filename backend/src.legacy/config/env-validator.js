// backend/src/config/env-validator.js
class EnvValidator {
    static validate() {
        const required = [
            'DATABASE_PATH',
            'FIREBIRD_HOST',
            'FIREBIRD_DATABASE',
            'FIREBIRD_USER',
            'FIREBIRD_PASSWORD'
        ];

        const missing = required.filter(key => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(
                `❌ Variáveis de ambiente faltando: ${missing.join(', ')}\n` +
                `   Configure o arquivo .env antes de iniciar.`
            );
        }

        console.log('✅ Todas as variáveis de ambiente estão configuradas');
    }
}

module.exports = EnvValidator;