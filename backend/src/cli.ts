// backend/src/cli.ts
//
// CLI NestJS — executa tarefas de manutenção do banco sem subir o servidor HTTP.
//
// Uso:
//   npx ts-node -r tsconfig-paths/register backend/src/cli.ts init-db
//   npx ts-node -r tsconfig-paths/register backend/src/cli.ts reset-db
//   npx ts-node -r tsconfig-paths/register backend/src/cli.ts check-db
//
// Em produção (após build):
//   node dist/backend/src/cli.js init-db
//   node dist/backend/src/cli.js reset-db
//   node dist/backend/src/cli.js check-db

import 'reflect-metadata';
import { NestFactory }            from '@nestjs/core';
import { AppModule }              from './app.module';
import { DatabaseControlService } from './database-control/database-control.service';

async function bootstrap(command: string) {
  // Cria o contexto NestJS SEM servidor HTTP (sem listen)
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],   // silencia logs de boot desnecessários
  });

  const dbControl = app.get(DatabaseControlService);

  switch (command) {

    // ─── init-db ────────────────────────────────────────────────────────────
    case 'init-db': {
      console.log('\n🔧 Inicializando banco de dados...\n');
      const resultado = await dbControl.criarTabelas();

      if (resultado.success) {
        console.log(`✅ Banco pronto — ${resultado.tabelas_criadas} tabela(s) criada(s).`);
      } else {
        console.error('❌ Falha ao criar tabelas.');
      }

      if (resultado.erros?.length) {
        console.warn(`⚠️  Avisos (${resultado.erros.length}):`);
        resultado.erros.forEach((e: string) => console.warn(`   - ${e}`));
      }

      // Exibe status do banco após criação
      await printStatus(dbControl);
      break;
    }

    // ─── reset-db ───────────────────────────────────────────────────────────
    case 'reset-db': {
      console.log('\n🗑️  Executando reset completo do banco...\n');

      // Confirmação de segurança via argumento adicional
      const force = process.argv.includes('--force');
      if (!force) {
        console.warn('⚠️  ATENÇÃO: Este comando apaga TODOS os dados!');
        console.warn('   Para confirmar, execute com a flag --force:');
        console.warn('   npm run reset-db -- --force\n');
        await app.close();
        process.exit(0);
      }

      const resultado = await dbControl.resetCompleto();
      console.log(`✅ Reset concluído — ${resultado.tabelas_criadas} tabela(s) recriada(s).`);
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
      console.log('   init-db   — cria as tabelas (idempotente)');
      console.log('   reset-db  — apaga tudo e recria (use --force para confirmar)');
      console.log('   check-db  — exibe status e contagem de registros\n');
      await app.close();
      process.exit(1);
    }
  }

  await app.close();
  process.exit(0);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function printStatus(dbControl: DatabaseControlService) {
  const stats = await dbControl.obterEstatisticas();
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

// ─── Entry point ────────────────────────────────────────────────────────────

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
