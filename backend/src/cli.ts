// backend/src/cli.ts

import 'reflect-metadata';
import { NestFactory }            from '@nestjs/core';
import { AppModule }              from './app.module';
import { DatabaseControlService } from './database-control/database-control.service';

async function bootstrap(command: string) {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const dbControl = app.get(DatabaseControlService);

  switch (command) {

    // ─── init-db ────────────────────────────────────────────────────────────
    case 'init-db': {
      console.log('\n🔧 Verificando banco de dados...\n');
      console.log('ℹ️  Com Drizzle ORM, a criação de tabelas é feita via migrations.');
      console.log('   Execute: npm run db:migrate\n');
      await printStatus(dbControl);
      break;
    }

    // ─── reset-db ───────────────────────────────────────────────────────────
    case 'reset-db': {
      console.log('\n🗑️  Limpando dados do banco...\n');

      const force = process.argv.includes('--force');
      if (!force) {
        console.warn('⚠️  ATENÇÃO: Este comando apaga TODOS os dados!');
        console.warn('   Para confirmar, execute com a flag --force:');
        console.warn('   npm run reset-db -- --force\n');
        await app.close();
        process.exit(0);
      }

      const resultado = await dbControl.limparDados();
      console.log(`✅ Dados limpos — ${resultado.tabelas_limpas} tabela(s) esvaziada(s).`);
      await printStatus(dbControl);
      break;
    }

    // ─── check-db ───────────────────────────────────────────────────────────
    case 'check-db': {
      console.log('\n🔍 Verificando banco de dados...\n');
      await printStatus(dbControl);
      break;
    }

    default: {
      console.error(`\n❌ Comando desconhecido: "${command}"`);
      console.log('\nComandos disponíveis:');
      console.log('   init-db   — exibe status (tabelas criadas via npm run db:migrate)');
      console.log('   reset-db  — apaga todos os registros (use --force para confirmar)');
      console.log('   check-db  — exibe status e contagem de registros\n');
      await app.close();
      process.exit(1);
    }
  }

  await app.close();
  process.exit(0);
}

async function printStatus(dbControl: DatabaseControlService) {
  const stats   = await dbControl.obterEstatisticas();
  const tabelas = stats.tabelas as Record<string, number | null>;

  console.log('\n📊 Registros por tabela:');

  const entries = Object.entries(tabelas);
  if (entries.length === 0) {
    console.log('   (nenhuma tabela encontrada)');
  } else {
    for (const [tabela, total] of entries) {
      const valor = total === null ? '(tabela ausente)' : String(total);
      console.log(`   ${tabela.padEnd(40)} ${valor}`);
    }
  }

  console.log(`\n   Gerado em: ${stats.timestamp}\n`);
}

const command = process.argv[2];

if (!command) {
  console.error('\n❌ Informe um comando. Exemplos:');
  console.error('   npm run init-db');
  console.error('   npm run reset-db');
  console.error('   npm run check-db\n');
  process.exit(1);
}

bootstrap(command).catch(err => {
  console.error('\n❌ Erro fatal no CLI:', err.message ?? err);
  process.exit(1);
});
