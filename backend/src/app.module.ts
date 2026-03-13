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
import { ComparatorModule }      from './comparator/comparator.module';

// ── Credenciais + cliente HTTP (declarados UMA VEZ) ───────────────────────────
import { CredencialModule }      from './importacao/credenciais/credencial.module';
import { VarejoFacilModule }     from './importacao/varejo-facil/varejo-facil.module';

// ── Domínios de importação ────────────────────────────────────────────────────
import { ImportacaoModule }      from './importacao/importacao.module';
import { ImportJobModule }       from './job/import-job.module';

// ── Sincronização ─────────────────────────────────────────────────────────────
import { SincronizacaoModule }   from './sincronizacao/sincronizacao.module';
import { FirebirdSyncModule }    from './firebird-sync/firebird-sync.module';

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
    ComparatorModule,

    // ── Credenciais e cliente HTTP ──────────────────────────────────────────
    CredencialModule,
    VarejoFacilModule,

    // ── Importação de dados API → SQLite ────────────────────────────────────
    ImportacaoModule,  
    ImportJobModule,

    // ── Sincronização SQLite → API e SQLite ↔ Firebird ──────────────────────
    SincronizacaoModule,
    FirebirdSyncModule,
  ],
})
export class AppModule {}