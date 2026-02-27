// backend/src/logger/logger.service.ts
import { Injectable }    from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs   from 'fs';
import * as path from 'path';

/**
 * Logger customizado com persistência em arquivo.
 * Diferencia níveis: info, success, warn, error, debug, sync.
 * Arquivo de log rotacionado diariamente: YYYY-MM-DD.log
 */
@Injectable()
export class AppLoggerService {
  private readonly logsDir: string;

  constructor(private config: ConfigService) {
    this.logsDir = config.get('LOG_DIR')
      ?? path.join(process.cwd(), 'logs');

    // Cria o diretório de logs se não existir
    fs.mkdirSync(this.logsDir, { recursive: true });
  }

  private write(level: string, emoji: string, message: string, meta?: any) {
    const ts       = new Date().toISOString();
    const metaStr  = meta ? ' ' + JSON.stringify(meta) : '';
    const line     = `[${ts}] [${level.padEnd(7)}] ${emoji} ${message}${metaStr}`;

    // Console sempre
    console.log(line);

    // Arquivo rotacionado por dia
    const file = path.join(this.logsDir, `${ts.slice(0, 10)}.log`);
    try {
      fs.appendFileSync(file, line + '\n');
    } catch {
      // Não quebra a aplicação se o log em arquivo falhar
    }
  }

  info(msg: string, meta?: any)    { this.write('INFO',    'ℹ️',  msg, meta); }
  success(msg: string, meta?: any) { this.write('SUCCESS', '✅',  msg, meta); }
  warn(msg: string, meta?: any)    { this.write('WARNING', '⚠️',  msg, meta); }
  error(msg: string, meta?: any)   { this.write('ERROR',   '❌',  msg, meta); }
  debug(msg: string, meta?: any)   { this.write('DEBUG',   '🔍',  msg, meta); }

  /** Atalho para logar resultado de uma sincronização */
  sync(entity: string, action: string, result: any) {
    const level = result.success ? 'success' : 'error';
    this[level](`🔄 Sync ${entity} — ${action}`, result);
  }
}
