// backend/src/firebird-sync/dto/comparar.dto.ts
import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional }            from '@nestjs/swagger';

/**
 * DTO para operações de comparação e migração SQLite ↔ Firebird.
 * Todos os campos são opcionais — usa defaults inteligentes quando omitidos.
 */
export class CompararDto {
  @ApiPropertyOptional({
    description: 'Nome da tabela no Firebird (padrão: domínio em MAIÚSCULAS)',
    example:     'PRODUTOS',
  })
  @IsOptional()
  @IsString()
  tabelaFirebird?: string;

  @ApiPropertyOptional({
    description: 'Campo chave para comparação entre os dois bancos',
    default:     'id',
    example:     'id',
  })
  @IsOptional()
  @IsString()
  campoChave?: string;

  @ApiPropertyOptional({
    description: 'Campos específicos a comparar (vazio = compara todos os campos)',
    example:     ['descricao', 'preco'],
    type:        [String],
  })
  @IsOptional()
  @IsArray()
  camposComparar?: string[];
}
