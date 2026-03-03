// backend/src/importacao/credenciais/credencial.module.ts
import { Module }               from '@nestjs/common';
import { CredencialController } from './credencial.controller';
import { CredencialService }    from './credencial.service';
import { VarejoFacilModule }    from '../varejo-facil/varejo-facil.module';

/**
 * CredencialModule
 *
 * Gerencia as credenciais da API Varejo Fácil (url, token, loja).
 * Exporta CredencialService para uso no ImportJobExecutorService.
 *
 * ─── FASE 3 — ATUALIZADO ────────────────────────────────────────────────────
 * Importa VarejoFacilModule para que o CredencialController possa injetar
 * VarejoFacilHttpService no endpoint GET/POST /api/credencial/testar-conexao.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Module({
  imports:     [VarejoFacilModule],   // ← novo: VarejoFacilHttpService para testar conexão
  controllers: [CredencialController],
  providers:   [CredencialService],
  exports:     [CredencialService],
})
export class CredencialModule {}
