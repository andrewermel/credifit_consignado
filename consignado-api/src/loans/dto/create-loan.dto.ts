import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLoanDto {
  @ApiProperty({
    description: 'Valor solicitado para o empréstimo em reais',
    example: 5000.00,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'Valor solicitado é obrigatório' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor deve ser um número com até 2 casas decimais' })
  @IsPositive({ message: 'Valor deve ser positivo' })
  @Transform(({ value }) => parseFloat(value))
  valorSolicitado: number;

  @ApiProperty({
    description: 'Número de parcelas para pagamento',
    example: 3,
    minimum: 1,
    maximum: 4,
  })
  @IsNotEmpty({ message: 'Número de parcelas é obrigatório' })
  @IsInt({ message: 'Número de parcelas deve ser um número inteiro' })
  @Min(1, { message: 'Número mínimo de parcelas é 1' })
  @Max(4, { message: 'Número máximo de parcelas é 4' })
  numeroParcelas: number;

  @ApiProperty({
    description: 'ID do funcionário solicitante',
    example: 'uuid-do-funcionario-aqui',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'ID do funcionário é obrigatório' })
  @IsUUID(4, { message: 'ID do funcionário deve ser um UUID válido' })
  employeeId: string;
}
