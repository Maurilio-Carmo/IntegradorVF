// backend/src/main.ts
import 'reflect-metadata';
import { NestFactory }    from '@nestjs/core';
import { AppModule }      from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // CORS — permite acesso do frontend e ferramentas externas
  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' });

  // Validação global via class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist:            true,
    forbidNonWhitelisted: false,
    transform:            true,
    transformOptions:     { enableImplicitConversion: true },
  }));

  // Filtro global de exceções — retorna JSON padronizado
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger — documentação em /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Integrador Varejo Fácil — API')
    .setDescription('Sistema de sincronização API ⇄ SQLite ⇄ Firebird')
    .setVersion('3.0.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'ApiKeyAuth')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-url' }, 'ApiUrlAuth')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Porta via .env — padrão 3000
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 NestJS:  http://localhost:${PORT}`);
  console.log(`📚 Swagger: http://localhost:${PORT}/docs`);
  console.log(`❤️  Health:  http://localhost:${PORT}/health`);
}

bootstrap();