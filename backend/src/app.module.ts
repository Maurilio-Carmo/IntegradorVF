// backend/src/app.module.ts
import { Module }                from '@nestjs/common';
import { ConfigModule }          from '@nestjs/config';

// Infraestrutura
import { DatabaseModule }        from './database/database.module';
import { LoggerModule }          from './logger/logger.module';

// Módulos de negócio
import { ImportacaoModule }      from './importacao/importacao.module';
import { ProxyModule }           from './proxy/proxy.module';
import { DatabaseControlModule } from './database-control/database-control.module';
import { ComparatorModule }      from './comparator/comparator.module';
import { SincronizacaoModule }   from './sincronizacao/sincronizacao.module';
import { FirebirdSyncModule }    from './firebird-sync/firebird-sync.module';
import { HealthModule }          from './health/health.module';

// Novos módulos de importação autônoma
import { CredencialModule }      from './importacao/credenciais/credencial.module';
import { VarejoFacilModule }     from './importacao/varejo-facil/varejo-facil.module';
import { ImportJobModule }       from './job/import-job.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', 'config/.env'],
      isGlobal:    true,
    }),

    // Infraestrutura
    DatabaseModule,
    LoggerModule,

    // Domínios existentes
    HealthModule,
    ImportacaoModule,
    ProxyModule,
    DatabaseControlModule,
    ComparatorModule,
    SincronizacaoModule,
    FirebirdSyncModule,

    // Credenciais
    CredencialModule,
    VarejoFacilModule,
    ImportJobModule,
  ],
})
export class AppModule {}