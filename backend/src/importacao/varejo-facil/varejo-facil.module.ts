// backend/src/importacao/varejo-facil/varejo-facil.module.ts
import { Module }                  from '@nestjs/common';
import { VarejoFacilHttpService }  from './varejo-facil-http.service';

/**
 * VarejoFacilModule
 *
 * Provê o cliente HTTP para a API Varejo Fácil.
 * Exporta VarejoFacilHttpService para uso no ImportJobExecutorService.
 */
@Module({
  providers: [VarejoFacilHttpService],
  exports:   [VarejoFacilHttpService],
})
export class VarejoFacilModule {}
