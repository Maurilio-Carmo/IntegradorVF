// backend/src/utils/logger.js
const fs   = require('fs');
const path = require('path');

// Detecta se está rodando como .exe empacotado pelo pkg
const isPackaged = typeof process.pkg !== 'undefined';

// Se for .exe, salva logs na pasta do executável
// Se for Node normal, salva em backend/logs
const LOGS_DIR = isPackaged
    ? path.join(path.dirname(process.execPath), 'logs')
    : path.join(__dirname, '..', '..', 'logs');

// ✅ Cria a pasta automaticamente se não existir
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}
class Logger {
    constructor() {
        this.logDir = process.env.LOG_DIR || LOGS_DIR;
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 30;
        
        this.levels = {
            error: 0,
            warning: 1,
            success: 2,
            info: 3,
            debug: 4
        };

        this.ensureLogDir();
        this.cleanOldLogs();
    }

    /**
     * Garantir que diretório de logs existe
     */
    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Limpar logs antigos (além do período de retenção)
     */
    cleanOldLogs() {
        try {
            const files = fs.readdirSync(this.logDir);
            const now = Date.now();
            const maxAge = this.retentionDays * 24 * 60 * 60 * 1000;

            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const stat = fs.statSync(filePath);
                
                if (now - stat.mtimeMs > maxAge) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Log antigo removido: ${file}`);
                }
            });
        } catch (error) {
            console.error('Erro ao limpar logs antigos:', error);
        }
    }

    /**
     * Verificar se deve logar baseado no nível
     */
    shouldLog(level) {
        const currentLevel = this.levels[this.logLevel] || 3;
        const messageLevel = this.levels[level] || 3;
        return messageLevel <= currentLevel;
    }

    /**
     * Log genérico
     */
    log(level, message, metadata = {}) {
        if (!this.shouldLog(level)) {
            return;
        }

        const timestamp = new Date().toISOString();
        
        const logEntry = {
            timestamp,
            level,
            message,
            ...metadata
        };

        // Exibir no console
        this.logToConsole(level, message, timestamp);

        // Salvar em arquivo
        this.logToFile(logEntry);
    }

    /**
     * Exibir log no console com formatação
     */
    logToConsole(level, message, timestamp) {
        const colors = {
            error: '\x1b[31m',      // Vermelho
            warning: '\x1b[33m',    // Amarelo
            success: '\x1b[32m',    // Verde
            info: '\x1b[36m',       // Ciano
            debug: '\x1b[90m'       // Cinza
        };

        const emoji = {
            error: '❌',
            warning: '⚠️',
            success: '✅',
            info: 'ℹ️',
            debug: '🐛'
        };

        const reset = '\x1b[0m';
        const color = colors[level] || colors.info;
        const icon = emoji[level] || '📝';

        const time = timestamp.split('T')[1].split('.')[0]; // HH:MM:SS
        
        console.log(`${color}${icon} [${time}] ${message}${reset}`);
    }

    /**
     * Salvar log em arquivo
     */
    logToFile(logEntry) {
        try {
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const logFile = path.join(this.logDir, `${date}.log`);
            
            const logLine = JSON.stringify(logEntry) + '\n';
            
            fs.appendFileSync(logFile, logLine);
        } catch (error) {
            console.error('Erro ao escrever log em arquivo:', error);
        }
    }

    /**
     * Métodos de conveniência
     */
    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }

    success(message, metadata = {}) {
        this.log('success', message, metadata);
    }

    warning(message, metadata = {}) {
        this.log('warning', message, metadata);
    }

    error(message, error = null) {
        const metadata = {};
        
        if (error) {
            if (error instanceof Error) {
                metadata.error = error.message;
                metadata.stack = error.stack;
            } else {
                metadata.error = error;
            }
        }
        
        this.log('error', message, metadata);
    }

    debug(message, metadata = {}) {
        this.log('debug', message, metadata);
    }

    /**
     * Log de transação de banco
     */
    transaction(operation, metadata = {}) {
        this.log('info', `💾 Transação: ${operation}`, metadata);
    }

    /**
     * Log de API request
     */
    apiRequest(method, url, status, duration) {
        const level = status >= 500 ? 'error' : 
                     status >= 400 ? 'warning' : 
                     'info';
        
        this.log(level, `${method} ${url} - ${status}`, { 
            duration: `${duration}ms` 
        });
    }

    /**
     * Log de sincronização
     */
    sync(entity, action, result) {
        const level = result.success ? 'success' : 'error';
        const message = `🔄 Sincronização: ${entity} - ${action}`;
        
        this.log(level, message, {
            entity,
            action,
            ...result
        });
    }

    /**
     * Criar separador visual
     */
    separator(char = '=', length = 50) {
        console.log(char.repeat(length));
    }

    /**
     * Log de inicialização
     */
    startup(appName, version) {
        this.separator();
        console.log(`🚀 ${appName} v${version}`);
        console.log(`📅 ${new Date().toISOString()}`);
        console.log(`🖥️  Node ${process.version}`);
        console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        this.separator();
    }
}

// Exportar instância singleton
module.exports = new Logger();