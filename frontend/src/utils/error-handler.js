// frontend/src/utils/error-handler.js

/**
 * Tratamento Centralizado de Erros
 * Classes de erro tipadas + handler global + wrapper para async.
 */

import UI from '../ui/ui.js';

// Classes de Erro Tipadas

/**
 * Erro base da aplicação
 */
export class AppError extends Error {
    constructor(message, code = 'APP_ERROR', details = {}) {
        super(message);
        this.name     = 'AppError';
        this.code     = code;
        this.details  = details;
        this.timestamp = new Date();
    }
}

/**
 * Erro de rede / API
 */
export class NetworkError extends AppError {
    constructor(message, statusCode = null, details = {}) {
        super(message, 'NETWORK_ERROR', details);
        this.name       = 'NetworkError';
        this.statusCode = statusCode;
    }
}

/**
 * Erro de configuração
 */
export class ConfigError extends AppError {
    constructor(message, details = {}) {
        super(message, 'CONFIG_ERROR', details);
        this.name = 'ConfigError';
    }
}

/**
 * Erro de importação
 */
export class ImportError extends AppError {
    constructor(message, entity = '', details = {}) {
        super(message, 'IMPORT_ERROR', details);
        this.name   = 'ImportError';
        this.entity = entity;
    }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
    constructor(message, fields = [], details = {}) {
        super(message, 'VALIDATION_ERROR', details);
        this.name   = 'ValidationError';
        this.fields = fields;
    }
}

// Handler Central

export const ErrorHandler = {

    /**
     * Tratar qualquer erro e exibir feedback adequado na UI
     */
    handle(error, context = '') {
        const prefix = context ? `[${context}] ` : '';

        // Log no console sempre
        console.error(`${prefix}${error.name || 'Error'}:`, error);

        // Feedback para o usuário por tipo
        if (error instanceof ValidationError) {
            const fields = error.fields.length
                ? ` (${error.fields.join(', ')})`
                : '';
            UI.alerts.warning(`${error.message}${fields}`);

        } else if (error instanceof ConfigError) {
            UI.alerts.warning(`⚙️ ${error.message}`);

        } else if (error instanceof NetworkError) {
            const status = error.statusCode ? ` [${error.statusCode}]` : '';
            UI.alerts.error(`🌐 Erro de rede${status}: ${error.message}`);

        } else if (error instanceof ImportError) {
            const entity = error.entity ? ` (${error.entity})` : '';
            UI.alerts.error(`📥 Erro na importação${entity}: ${error.message}`);

        } else if (error instanceof AppError) {
            UI.alerts.error(`❌ ${error.message}`);

        } else if (error.name === 'TypeError') {
            UI.alerts.error('Erro de tipo: verifique os dados enviados');

        } else if (error.name === 'SyntaxError') {
            UI.alerts.error('Erro de sintaxe: resposta inválida da API');

        } else {
            UI.alerts.error(`❌ Erro inesperado: ${error.message}`);
        }

        // Log no módulo de log da UI (não falha se UI não estiver pronta)
        try {
            UI.log(`${prefix}${error.message}`, 'error');
        } catch (_) { /* silenciar se UI ainda não foi inicializada */ }
    },

    /**
     * Wrapper para funções async — captura e trata automaticamente
     *
     *   const importarSeguro = ErrorHandler.wrap(importar, 'ImportacaoService')
     *   await importarSeguro()
     */
    wrap(fn, context = '') {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error; // repropagar para quem quiser tratar
            }
        };
    },

    /**
     * Wrapper síncrono
     */
    wrapSync(fn, context = '') {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error;
            }
        };
    },

    /**
     * Tentar executar com retry automático
     *
     *   await ErrorHandler.retry(() => API.buscar(), 3, 1000)
     */
    async retry(fn, maxAttempts = 3, delayMs = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Tentativa ${attempt}/${maxAttempts} falhou: ${error.message}`);

                // Não aguardar após a última tentativa
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, delayMs * attempt));
                }
            }
        }

        throw lastError;
    },

    /**
     * Ignorar erro e retornar valor padrão
     *
     *   const dados = await ErrorHandler.safe(() => API.buscar(), [])
     */
    async safe(fn, defaultValue = null) {
        try {
            return await fn();
        } catch (error) {
            console.warn('⚠️ Erro ignorado (safe):', error.message);
            return defaultValue;
        }
    }
};

// Captura Global

/**
 * Instalar captura global de erros não tratados.
 * Chamar uma vez na inicialização do app.
 */
export function ErrorHandlers() {
    // Erros síncronos não capturados
    window.addEventListener('error', (event) => {
        console.error('🔴 Erro global:', event.error);
        // Não exibir toast para evitar spam em erros de scripts externos
    });

    // Promises rejeitadas não capturadas
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        console.error('🔴 Promise rejeitada:', error);
        ErrorHandler.handle(
            error instanceof Error ? error : new AppError(String(error)),
            'unhandledRejection'
        );
        event.preventDefault(); // evitar log duplicado no console
    });

    console.log('✅ Captura global de erros instalada');
}

export default ErrorHandler;