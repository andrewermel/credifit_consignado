import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'CNPJ da empresa (apenas números)',
    example: '12345678000199',
    minLength: 14,
    maxLength: 14,
  })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Length(14, 14, { message: 'CNPJ deve ter exatamente 14 dígitos' })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas números' })
  cnpj: string;

  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Empresa de Tecnologia LTDA',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @IsString({ message: 'Razão social deve ser uma string' })
  @Length(1, 255, { message: 'Razão social deve ter entre 1 e 255 caracteres' })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome completo do representante da empresa',
    example: 'João Silva Santos',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @IsString({ message: 'Nome completo deve ser uma string' })
  @Length(1, 255, { message: 'Nome completo deve ter entre 1 e 255 caracteres' })
  nomeCompleto: string;

  @ApiProperty({
    description: 'CPF do representante (apenas números)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString({ message: 'CPF deve ser uma string' })
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas números' })
  cpf: string;

  @ApiProperty({
    description: 'Email do representante da empresa',
    example: 'representante@empresa.com.br',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Length(1, 255, { message: 'Email deve ter entre 1 e 255 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Senha para acesso ao sistema',
    example: 'SenhaSegura123!',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(6, 255, { message: 'Senha deve ter entre 6 e 255 caracteres' })
  senha: string;
}
