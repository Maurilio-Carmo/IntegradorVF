// backend/src/importacao/dto/importar-array.dto.ts
import { IsArray, ArrayNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional }              from '@nestjs/swagger';

/**
 * DTO base para todos os endpoints de importação.
 * Garante que o body tenha sempre um array não-vazio em "data".
 */
export class ImportarArrayDto {
  @ApiProperty({
    type:        [Object],
    description: 'Array de registros recebidos da API Varejo Fácil',
    example:     [{ id: 1, descricao: 'Exemplo' }],
  })
  @IsArray({ message: 'Body inválido: "data" deve ser um array' })
  @ArrayNotEmpty({ message: '"data" não pode ser um array vazio' })
  data: Record<string, any>[];

  @ApiPropertyOptional({
    description: 'ID da loja — obrigatório apenas para importação de produtos',
    example:     1,
  })
  @IsOptional()
  @IsNumber()
  lojaId?: number;
}
