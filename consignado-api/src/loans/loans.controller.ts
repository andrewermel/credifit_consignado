import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanQuoteDto } from './dto/loan-quote.dto';
import { LoanQuoteResponseDto } from './dto/loan-quote-response.dto';

@ApiTags('loans')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('quote')
  @ApiOperation({ 
    summary: 'Consultar cotação de empréstimo',
    description: 'Consulta a margem disponível e opções de parcelamento para um funcionário'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cotação consultada com sucesso',
    type: LoanQuoteResponseDto
  })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  consultarCotacao(@Body() loanQuoteDto: LoanQuoteDto) {
    return this.loansService.consultarCotacao(loanQuoteDto);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Solicitar empréstimo',
    description: 'Cria uma nova solicitação de empréstimo consignado'
  })
  @ApiResponse({ status: 201, description: 'Empréstimo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou empréstimo rejeitado' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar empréstimos',
    description: 'Lista todos os empréstimos do sistema'
  })
  @ApiResponse({ status: 200, description: 'Lista de empréstimos' })
  findAll() {
    return this.loansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar empréstimo por ID',
    description: 'Retorna detalhes de um empréstimo específico'
  })
  @ApiResponse({ status: 200, description: 'Empréstimo encontrado' })
  @ApiResponse({ status: 404, description: 'Empréstimo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar empréstimo',
    description: 'Atualiza dados de um empréstimo existente'
  })
  @ApiResponse({ status: 200, description: 'Empréstimo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Empréstimo não encontrado' })
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remover empréstimo',
    description: 'Remove um empréstimo do sistema'
  })
  @ApiResponse({ status: 200, description: 'Empréstimo removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Empréstimo não encontrado' })
  remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }
}
