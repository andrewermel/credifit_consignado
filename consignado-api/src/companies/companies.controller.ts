import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar nova empresa',
    description: 'Cadastra uma nova empresa conveniada no sistema'
  })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CNPJ, CPF ou email já cadastrado' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar empresas',
    description: 'Lista todas as empresas cadastradas no sistema'
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar empresa por ID',
    description: 'Retorna detalhes de uma empresa específica'
  })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar empresa',
    description: 'Atualiza dados de uma empresa existente'
  })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({ status: 409, description: 'CNPJ, CPF ou email já em uso' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remover empresa',
    description: 'Remove uma empresa do sistema'
  })
  @ApiResponse({ status: 200, description: 'Empresa removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({ status: 409, description: 'Empresa possui funcionários vinculados' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
