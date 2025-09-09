import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    // Verificar se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: createEmployeeDto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se CPF já existe
    const existingCpf = await this.prisma.employee.findUnique({
      where: { cpf: createEmployeeDto.cpf },
    });

    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado no sistema');
    }

    // Verificar se email já existe
    const existingEmail = await this.prisma.employee.findUnique({
      where: { email: createEmployeeDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(createEmployeeDto.senha, 10);

    // Criar funcionário
    const employee = await this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        senha: hashedPassword,
      },
      include: {
        company: {
          select: {
            id: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
      },
    });

    // Retornar sem a senha
    const { senha, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
  }

  async findAll() {
    const employees = await this.prisma.employee.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        salario: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
        loans: {
          select: {
            id: true,
            valorSolicitado: true,
            valorAprovado: true,
            status: true,
            dataSolicitacao: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return employees;
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        salario: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            razaoSocial: true,
            cnpj: true,
            nomeCompleto: true,
            email: true,
          },
        },
        loans: {
          select: {
            id: true,
            valorSolicitado: true,
            valorAprovado: true,
            numeroParcelas: true,
            status: true,
            scoreConsultado: true,
            dataSolicitacao: true,
            dataPagamento: true,
          },
          orderBy: {
            dataSolicitacao: 'desc',
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    // Verificar se nova empresa existe (se fornecida)
    if (updateEmployeeDto.companyId && updateEmployeeDto.companyId !== employee.company.id) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateEmployeeDto.companyId },
      });

      if (!company) {
        throw new NotFoundException('Empresa não encontrada');
      }
    }

    // Verificar conflitos apenas se os campos foram alterados
    if (updateEmployeeDto.cpf && updateEmployeeDto.cpf !== employee.cpf) {
      const existingCpf = await this.prisma.employee.findUnique({
        where: { cpf: updateEmployeeDto.cpf },
      });

      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado no sistema');
      }
    }

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmail = await this.prisma.employee.findUnique({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email já cadastrado no sistema');
      }
    }

    // Criptografar nova senha se fornecida
    let updateData = { ...updateEmployeeDto };
    if (updateEmployeeDto.senha) {
      updateData.senha = await bcrypt.hash(updateEmployeeDto.senha, 10);
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        salario: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
      },
    });

    return updatedEmployee;
  }

  async remove(id: string) {
    const employee = await this.findOne(id);

    // Verificar se há empréstimos vinculados
    const loanCount = await this.prisma.loan.count({
      where: { employeeId: id },
    });

    if (loanCount > 0) {
      throw new ConflictException(
        `Não é possível excluir o funcionário. Existe(m) ${loanCount} empréstimo(s) vinculado(s).`
      );
    }

    await this.prisma.employee.delete({
      where: { id },
    });

    return { message: 'Funcionário removido com sucesso' };
  }

  async findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });
  }

  async findByCpf(cpf: string) {
    return this.prisma.employee.findUnique({
      where: { cpf },
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        salario: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
      },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        salario: true,
        createdAt: true,
        loans: {
          select: {
            id: true,
            valorSolicitado: true,
            status: true,
            dataSolicitacao: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
