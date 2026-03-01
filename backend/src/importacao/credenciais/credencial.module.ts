// backend/src/importacao/credenciais/credencial.module.ts
import { Module }               from '@nestjs/common';
import { CredencialController } from './credencial.controller';
import { CredencialService }    from './credencial.service';

/**
 * CredencialModule
 *
 * Gerencia as credenciais da API Varejo Fácil (url, token, loja).
 * Exporta CredencialService para uso no VarejoFacilHttpService
 * e no ImportJobExecutorService.
 */
@Module({
  controllers: [CredencialController],
  providers:   [CredencialService],
  exports:     [CredencialService],
})
export class CredencialModule {}
