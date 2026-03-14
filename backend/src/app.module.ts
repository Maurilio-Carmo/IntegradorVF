// backend/src/app.module.ts

import { Module }                from '@nestjs/common';
import { ConfigModule }          from '@nestjs/config';

// ── Infraestrutura ────────────────────────────────────────────────────────────
import { DatabaseModule }        from './database/database.module';
import { LoggerModule }          from './logger/logger.module';

// ── Utilitários / Infra de domínio ────────────────────────────────────────────
import { HealthModule }          from './health/health.module';
import { ProxyModule }           from './proxy/proxy.module';
import { DatabaseControlModule } from './database-control/database-control.module';

// ── Credenciais + cliente HTTP (declarados UMA VEZ) ───────────────────────────
import { CredencialModule }      from './importacao/module/credencial.module';
import { VarejoFacilModule }     from './importacao/module/varejo-facil.module';

// ── Domínios de importação ────────────────────────────────────────────────────
import { ImportacaoModule }      from './importacao/module/importacao.module';
import { ImportJobModule }       from './job/import-job.module';

// ── Sincronização ─────────────────────────────────────────────────────────────
import { SincronizacaoModule }   from './sincronizacao/sincronizacao.module';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      envFilePath: ['.env', 'config/.env'],
      isGlobal:    true,
    }),

    // ── Infraestrutura (Global) ─────────────────────────────────────────────
    DatabaseModule,
    LoggerModule,

    // ── Saúde e utilitários ─────────────────────────────────────────────────
    HealthModule,
    ProxyModule,
    DatabaseControlModule,

    // ── Credenciais e cliente HTTP ──────────────────────────────────────────
    CredencialModule,
    VarejoFacilModule,

    // ── Importação de dados API → SQLite ────────────────────────────────────
    ImportacaoModule,  
    ImportJobModule,

    // ── Sincronização SQLite → API e SQLite ↔ Firebird ──────────────────────
    SincronizacaoModule,
  ],
})
export class AppModule {}