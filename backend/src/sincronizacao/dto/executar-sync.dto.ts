// backend/src/sincronizacao/dto/executar-sync.dto.ts
import { IsString, IsIn } from 'class-validator';
import { ApiProperty }    from '@nestjs/swagger';

/** Lista de domínios válidos para sincronização */
export const DOMINIOS_VALIDOS = [
  'produtos', 'secoes', 'grupos', 'subgrupos', 'marcas', 'familias',
  'produto_auxiliares', 'produto_fornecedores',
  'clientes', 'fornecedores', 'lojas',
  'categorias', 'agentes', 'contas_correntes',
  'formas_pagamento', 'local_estoque', 'saldo_estoque',
  'regime_tributario', 'situacoes_fiscais', 'tipos_operacoes',
  'impostos_federais', 'tabelas_tributarias', 'cenarios_fiscais',
] as const;

export class ExecutarSyncDto {
  @ApiProperty({
    description: 'Nome da tabela/domínio a sincronizar com a API',
    example:     'produtos',
    enum:        DOMINIOS_VALIDOS,
  })
  @IsString()
  @IsIn(DOMINIOS_VALIDOS as unknown as string[])
  dominio: string;
}
