import { ApiProperty } from '@nestjs/swagger';

export class LoanOptionDto {
  @ApiProperty({
    description: 'Número de parcelas',
    example: 3,
  })
  numeroParcelas: number;

  @ApiProperty({
    description: 'Valor de cada parcela',
    example: 1666.67,
  })
  valorParcela: number;

  @ApiProperty({
    description: 'Data do primeiro vencimento',
    example: '2025-10-08T00:00:00.000Z',
  })
  dataVencimento: Date;
}

export class LoanQuoteResponseDto {
  @ApiProperty({
    description: 'Valor máximo que pode ser solicitado baseado no salário',
    example: 2100.00,
  })
  valorMaximo: number;

  @ApiProperty({
    description: 'Margem disponível para consignado (35% do salário)',
    example: 2100.00,
  })
  margemDisponivel: number;

  @ApiProperty({
    description: 'Score de crédito consultado',
    example: 650,
  })
  score: number;

  @ApiProperty({
    description: 'Se o funcionário é elegível para empréstimo',
    example: true,
  })
  elegivel: boolean;

  @ApiProperty({
    description: 'Motivo da inelegibilidade (se aplicável)',
    example: 'Score insuficiente para a faixa salarial',
    required: false,
  })
  motivoInelegibilidade?: string;

  @ApiProperty({
    description: 'Opções de parcelamento disponíveis',
    type: [LoanOptionDto],
  })
  opcoesParcelas: LoanOptionDto[];
}
