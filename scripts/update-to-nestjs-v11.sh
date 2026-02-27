#!/usr/bin/env bash
# =============================================================================
# SCRIPT DE ATUALIZAÇÃO PARA NestJS v11
# Arquivo: scripts/update-to-nestjs-v11.sh
#
# Executar na raiz do projeto:
#   bash scripts/update-to-nestjs-v11.sh
# =============================================================================

set -e  # Aborta se qualquer comando falhar

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ATUALIZAÇÃO NestJS v10 → v11   Integrador VF      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Remover dependências conflitantes / redundantes ───────────────────────
echo "🗑️  Removendo pacotes redundantes e conflitantes..."
npm uninstall \
  cors \
  dotenv \
  express \
  swagger-ui-express \
  @nestjs/config 2>/dev/null || true

# ─── 2. Instalar NestJS v11 e dependências atualizadas ────────────────────────
echo ""
echo "📦 Instalando NestJS v11..."
npm install --save \
  @nestjs/common@^11.0.0 \
  @nestjs/core@^11.0.0 \
  @nestjs/platform-express@^11.0.0 \
  @nestjs/config@^4.0.0 \
  @nestjs/serve-static@^5.0.0 \
  @nestjs/swagger@^11.0.0 \
  reflect-metadata@^0.2.0 \
  rxjs@^7.8.0 \
  class-validator@^0.14.0 \
  class-transformer@^0.5.1 \
  better-sqlite3@^12.6.2 \
  node-firebird@^1.1.10

# ─── 3. Atualizar devDependencies ─────────────────────────────────────────────
echo ""
echo "🔧 Atualizando devDependencies..."
npm install --save-dev \
  @nestjs/testing@^11.0.0 \
  @types/node@^22.0.0 \
  @types/express@^5.0.0 \
  @types/better-sqlite3@^7.6.0 \
  @types/jest@^29.0.0 \
  typescript@^5.0.0 \
  ts-node@^10.9.0 \
  ts-jest@^29.0.0 \
  tsconfig-paths@^4.0.0 \
  nodemon@^3.0.0 \
  jest@^29.0.0

# ─── 4. Verificar peer dependencies ───────────────────────────────────────────
echo ""
echo "🔍 Verificando peer dependencies..."
npm ls @nestjs/common @nestjs/core @nestjs/platform-express \
       @nestjs/config @nestjs/serve-static @nestjs/swagger \
       reflect-metadata 2>/dev/null || true

# ─── 5. Testar compilação TypeScript ─────────────────────────────────────────
echo ""
echo "⚙️  Testando compilação TypeScript..."
npx tsc --noEmit -p tsconfig.json && echo "✅ TypeScript OK" || echo "❌ Erros de TypeScript — verifique acima"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✅ Atualização concluída!                          ║"
echo "║   Execute: npm run nest:dev                          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
