import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches, IsUUID, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({
    description: 'Nome completo do funcionário',
    example: 'Maria Silva Santos',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Nome completo deve ser uma string' })
  @Length(1, 255, { message: 'Nome completo deve ter entre 1 e 255 caracteres' })
  nomeCompleto?: string;

  @ApiPropertyOptional({
    description: 'CPF do funcionário (apenas números)',
    example: '98765432100',
    minLength: 11,
    maxLength: 11,
  })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas números' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Email do funcionário',
    example: 'funcionario@email.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Length(1, 255, { message: 'Email deve ter entre 1 e 255 caracteres' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha para acesso ao sistema',
    example: 'MinhaSenh@123',
    minLength: 6,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(6, 255, { message: 'Senha deve ter entre 6 e 255 caracteres' })
  senha?: string;

  @ApiPropertyOptional({
    description: 'Salário do funcionário em reais',
    example: 3500.50,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Salário deve ser um número com até 2 casas decimais' })
  @IsPositive({ message: 'Salário deve ser um valor positivo' })
  @Transform(({ value }) => parseFloat(value))
  salario?: number;

  @ApiPropertyOptional({
    description: 'ID da empresa conveniada',
    example: 'uuid-da-empresa-aqui',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID da empresa deve ser um UUID válido' })
  companyId?: string;
}
