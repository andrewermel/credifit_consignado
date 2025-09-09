import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    // Verificar se CNPJ já existe
    const existingCnpj = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCnpj) {
      throw new ConflictException('CNPJ já cadastrado no sistema');
    }

    // Verificar se CPF já existe
    const existingCpf = await this.prisma.company.findUnique({
      where: { cpf: createCompanyDto.cpf },
    });

    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado no sistema');
    }

    // Verificar se email já existe
    const existingEmail = await this.prisma.company.findUnique({
      where: { email: createCompanyDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(createCompanyDto.senha, 10);

    // Criar empresa
    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        senha: hashedPassword,
      },
    });

    // Retornar sem a senha
    const { senha, ...companyWithoutPassword } = company;
    return companyWithoutPassword;
  }

  async findAll() {
    const companies = await this.prisma.company.findMany({
      select: {
        id: true,
        cnpj: true,
        razaoSocial: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        employees: {
          select: {
            id: true,
            nomeCompleto: true,
            email: true,
            salario: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return companies;
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        cnpj: true,
        razaoSocial: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        employees: {
          select: {
            id: true,
            nomeCompleto: true,
            cpf: true,
            email: true,
            salario: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    // Verificar conflitos apenas se os campos foram alterados
    if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
      const existingCnpj = await this.prisma.company.findUnique({
        where: { cnpj: updateCompanyDto.cnpj },
      });

      if (existingCnpj) {
        throw new ConflictException('CNPJ já cadastrado no sistema');
      }
    }

    if (updateCompanyDto.cpf && updateCompanyDto.cpf !== company.cpf) {
      const existingCpf = await this.prisma.company.findUnique({
        where: { cpf: updateCompanyDto.cpf },
      });

      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado no sistema');
      }
    }

    if (updateCompanyDto.email && updateCompanyDto.email !== company.email) {
      const existingEmail = await this.prisma.company.findUnique({
        where: { email: updateCompanyDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email já cadastrado no sistema');
      }
    }

    // Criptografar nova senha se fornecida
    let updateData = { ...updateCompanyDto };
    if (updateCompanyDto.senha) {
      updateData.senha = await bcrypt.hash(updateCompanyDto.senha, 10);
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        cnpj: true,
        razaoSocial: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedCompany;
  }

  async remove(id: string) {
    const company = await this.findOne(id);

    // Verificar se há funcionários vinculados
    const employeeCount = await this.prisma.employee.count({
      where: { companyId: id },
    });

    if (employeeCount > 0) {
      throw new ConflictException(
        `Não é possível excluir a empresa. Existe(m) ${employeeCount} funcionário(s) vinculado(s).`
      );
    }

    await this.prisma.company.delete({
      where: { id },
    });

    return { message: 'Empresa removida com sucesso' };
  }

  async findByEmail(email: string) {
    return this.prisma.company.findUnique({
      where: { email },
    });
  }

  async findByCnpj(cnpj: string) {
    return this.prisma.company.findUnique({
      where: { cnpj },
      select: {
        id: true,
        cnpj: true,
        razaoSocial: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
