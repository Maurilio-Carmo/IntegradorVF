// backend/src/app.module.ts
import { Module }                   from '@nestjs/common';
import { ConfigModule }             from '@nestjs/config';
import { ServeStaticModule }        from '@nestjs/serve-static';
import * as path                    from 'path';

// Módulos de infraestrutura (globais)
import { DatabaseModule }           from './database/database.module';
import { LoggerModule }             from './logger/logger.module';

// Módulos de negócio
import { ImportacaoModule }         from './importacao/importacao.module';
import { ProxyModule }              from './proxy/proxy.module';
import { DatabaseControlModule }    from './database-control/database-control.module';
import { ComparatorModule }         from './comparator/comparator.module';
import { SincronizacaoModule }      from './sincronizacao/sincronizacao.module';
import { FirebirdSyncModule }       from './firebird-sync/firebird-sync.module';

// Health check
import { HealthController }         from './health/health.controller';

@Module({
  imports: [
    // Lê config/.env e .env na raiz — disponível globalmente
    ConfigModule.forRoot({
      envFilePath: ['config/.env', '.env'],
      isGlobal:    true,
    }),

    // Serve o frontend estático em / (exceto rotas de API)
    ServeStaticModule.forRoot({
      rootPath:  path.join(process.cwd(), 'frontend'),
      exclude:   ['/api*', '/docs*', '/health*'],
      serveStaticOptions: { index: 'index.html' },
    }),

    // Infraestrutura
    DatabaseModule,
    LoggerModule,

    // Domínios de negócio
    ImportacaoModule,
    ProxyModule,
    DatabaseControlModule,
    ComparatorModule,
    SincronizacaoModule,
    FirebirdSyncModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
