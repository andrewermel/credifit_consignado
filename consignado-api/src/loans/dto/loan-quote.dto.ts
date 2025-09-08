import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class LoanQuoteDto {
  @ApiProperty({
    description: 'ID do funcionário para consultar a cotação',
    example: 'uuid-do-funcionario-aqui',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'ID do funcionário é obrigatório' })
  @IsUUID(4, { message: 'ID do funcionário deve ser um UUID válido' })
  employeeId: string;
}
