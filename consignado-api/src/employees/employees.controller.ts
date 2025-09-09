import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo funcionário',
    description: 'Cadastra um novo funcionário vinculado a uma empresa'
  })
  @ApiResponse({ status: 201, description: 'Funcionário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @ApiResponse({ status: 409, description: 'CPF ou email já cadastrado' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar funcionários',
    description: 'Lista todos os funcionários cadastrados no sistema'
  })
  @ApiResponse({ status: 200, description: 'Lista de funcionários' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar funcionário por ID',
    description: 'Retorna detalhes de um funcionário específico'
  })
  @ApiResponse({ status: 200, description: 'Funcionário encontrado' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar funcionário',
    description: 'Atualiza dados de um funcionário existente'
  })
  @ApiResponse({ status: 200, description: 'Funcionário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  @ApiResponse({ status: 409, description: 'CPF ou email já em uso' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remover funcionário',
    description: 'Remove um funcionário do sistema'
  })
  @ApiResponse({ status: 200, description: 'Funcionário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  @ApiResponse({ status: 409, description: 'Funcionário possui empréstimos vinculados' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
