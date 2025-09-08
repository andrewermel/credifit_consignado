import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiPropertyOptional({
    description: 'CNPJ da empresa (apenas números)',
    example: '12345678000199',
    minLength: 14,
    maxLength: 14,
  })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Length(14, 14, { message: 'CNPJ deve ter exatamente 14 dígitos' })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas números' })
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Razão social da empresa',
    example: 'Empresa de Tecnologia LTDA',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Razão social deve ser uma string' })
  @Length(1, 255, { message: 'Razão social deve ter entre 1 e 255 caracteres' })
  razaoSocial?: string;

  @ApiPropertyOptional({
    description: 'Nome completo do representante da empresa',
    example: 'João Silva Santos',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Nome completo deve ser uma string' })
  @Length(1, 255, { message: 'Nome completo deve ter entre 1 e 255 caracteres' })
  nomeCompleto?: string;

  @ApiPropertyOptional({
    description: 'CPF do representante (apenas números)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
  })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas números' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Email do representante da empresa',
    example: 'representante@empresa.com.br',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Length(1, 255, { message: 'Email deve ter entre 1 e 255 caracteres' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha para acesso ao sistema',
    example: 'SenhaSegura123!',
    minLength: 6,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(6, 255, { message: 'Senha deve ter entre 6 e 255 caracteres' })
  senha?: string;
}
