// backend/src/app.module.ts
import { Module }                from '@nestjs/common';
import { ConfigModule }          from '@nestjs/config';
import { ServeStaticModule }     from '@nestjs/serve-static';
import * as path                 from 'path';

// Infraestrutura (globais — injetáveis em qualquer módulo)
import { DatabaseModule }        from './database/database.module';
import { LoggerModule }          from './logger/logger.module';

// Módulos de negócio
import { ImportacaoModule }      from './importacao/importacao.module';
import { ProxyModule }           from './proxy/proxy.module';
import { DatabaseControlModule } from './database-control/database-control.module';
import { ComparatorModule }      from './comparator/comparator.module';
import { SincronizacaoModule }   from './sincronizacao/sincronizacao.module';
import { FirebirdSyncModule }    from './firebird-sync/firebird-sync.module';

// Health check encapsulado no próprio módulo
import { HealthModule }          from './health/health.module';

@Module({
  imports: [
    // Configuração
    ConfigModule.forRoot({
      envFilePath: ['.env', 'config/.env'],
      isGlobal:    true,
    }),

    // Frontend estático
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'frontend'),
      exclude: ['/api*', '/docs*', '/health'],
      serveStaticOptions: { index: 'index.html'},
    }),

    // Infraestrutura
    DatabaseModule,
    LoggerModule,

    // Domínios
    HealthModule,
    ImportacaoModule,
    ProxyModule,
    DatabaseControlModule,
    ComparatorModule,
    SincronizacaoModule,
    FirebirdSyncModule,
  ],
})
export class AppModule {}