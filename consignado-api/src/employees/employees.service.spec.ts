import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

// Mock do bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prismaService: PrismaService;

  const mockCompany = {
    id: 'comp-123',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Empresa Teste LTDA',
    nomeCompleto: 'João Silva',
    cpf: '123.456.789-01',
    email: 'joao@empresa.com',
    senha: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployee = {
    id: 'emp-123',
    nomeCompleto: 'Maria Silva',
    cpf: '987.654.321-01',
    email: 'maria@test.com',
    senha: 'hashed_password',
    salario: new Decimal(5000),
    companyId: 'comp-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    company: {
      id: 'comp-123',
      razaoSocial: 'Empresa Teste LTDA',
      cnpj: '12.345.678/0001-90',
    },
  };

  const createEmployeeDto = {
    nomeCompleto: 'Maria Silva',
    cpf: '987.654.321-01',
    email: 'maria@test.com',
    senha: '123456',
    salario: 5000,
    companyId: 'comp-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              findUnique: jest.fn(),
            },
            employee: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            loan: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Setup bcrypt mock
    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an employee successfully', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.employee, 'create').mockResolvedValue(mockEmployee);

      const result = await service.create(createEmployeeDto);

      expect(result).not.toHaveProperty('senha');
      expect(result.id).toBe('emp-123');
      expect(result.email).toBe('maria@test.com');
      expect(result.company).toBeDefined();
      expect(prismaService.employee.create).toHaveBeenCalled();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('123456', 10);
    });

    it('should throw NotFoundException when company not found', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createEmployeeDto))
        .rejects
        .toThrow(new NotFoundException('Empresa não encontrada'));
    });

    it('should throw ConflictException when CPF already exists', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);
      jest.spyOn(prismaService.employee, 'findUnique')
        .mockResolvedValueOnce(mockEmployee); // CPF check

      await expect(service.create(createEmployeeDto))
        .rejects
        .toThrow(new ConflictException('CPF já cadastrado no sistema'));
    });

    it('should throw ConflictException when email already exists', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);
      jest.spyOn(prismaService.employee, 'findUnique')
        .mockResolvedValueOnce(null) // CPF check
        .mockResolvedValueOnce(mockEmployee); // Email check

      await expect(service.create(createEmployeeDto))
        .rejects
        .toThrow(new ConflictException('Email já cadastrado no sistema'));
    });
  });

  describe('findAll', () => {
    it('should return all employees', async () => {
      const mockEmployees = [mockEmployee];
      jest.spyOn(prismaService.employee, 'findMany').mockResolvedValue(mockEmployees as any);

      const result = await service.findAll();

      expect(result).toEqual(mockEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee as any);

      const result = await service.findOne('emp-123');

      expect(result).toEqual(mockEmployee);
      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 'emp-123' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('invalid-id'))
        .rejects
        .toThrow(new NotFoundException('Funcionário não encontrado'));
    });
  });

  describe('update', () => {
    const updateEmployeeDto = {
      nomeCompleto: 'Maria Santos',
      email: 'maria.santos@test.com',
      salario: 6000,
    };

    it('should update an employee successfully', async () => {
      const mockUpdatedEmployee = { ...mockEmployee, ...updateEmployeeDto };

      // Mock findOne usado no update
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null); // No conflicts
      jest.spyOn(prismaService.employee, 'update').mockResolvedValue(mockUpdatedEmployee as any);

      const result = await service.update('emp-123', updateEmployeeDto);

      expect(result).toEqual(mockUpdatedEmployee);
      expect(prismaService.employee.update).toHaveBeenCalled();
    });

    it('should hash password when updating password', async () => {
      const updateWithPassword = { ...updateEmployeeDto, senha: 'newpassword' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.employee, 'update').mockResolvedValue(mockEmployee as any);

      await service.update('emp-123', updateWithPassword);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });

    it('should validate company exists when changing company', async () => {
      const updateWithNewCompany = { ...updateEmployeeDto, companyId: 'comp-456' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);

      await expect(service.update('emp-123', updateWithNewCompany))
        .rejects
        .toThrow(new NotFoundException('Empresa não encontrada'));
    });

    it('should throw ConflictException when updating to existing email', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);

      await expect(service.update('emp-123', { email: 'existing@email.com' }))
        .rejects
        .toThrow(new ConflictException('Email já cadastrado no sistema'));
    });
  });

  describe('remove', () => {
    it('should remove an employee successfully when no loans linked', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService.loan, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.employee, 'delete').mockResolvedValue(mockEmployee);

      const result = await service.remove('emp-123');

      expect(result).toEqual({ message: 'Funcionário removido com sucesso' });
      expect(prismaService.employee.delete).toHaveBeenCalledWith({
        where: { id: 'emp-123' },
      });
    });

    it('should throw ConflictException when loans are linked', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prismaService.loan, 'count').mockResolvedValue(2);

      await expect(service.remove('emp-123'))
        .rejects
        .toThrow(new ConflictException('Não é possível excluir o funcionário. Existe(m) 2 empréstimo(s) vinculado(s).'));
    });
  });

  describe('findByEmail', () => {
    it('should return employee by email', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);

      const result = await service.findByEmail('maria@test.com');

      expect(result).toEqual(mockEmployee);
      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { email: 'maria@test.com' },
        include: {
          company: true,
        },
      });
    });

    it('should return null when employee not found by email', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('notfound@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findByCpf', () => {
    it('should return employee by CPF', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee as any);

      const result = await service.findByCpf('987.654.321-01');

      expect(result).toEqual(mockEmployee);
      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { cpf: '987.654.321-01' },
        select: expect.any(Object),
      });
    });

    it('should return null when employee not found by CPF', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);

      const result = await service.findByCpf('000.000.000-00');

      expect(result).toBeNull();
    });
  });

  describe('findByCompany', () => {
    it('should return employees by company', async () => {
      const mockEmployees = [mockEmployee];
      jest.spyOn(prismaService.employee, 'findMany').mockResolvedValue(mockEmployees as any);

      const result = await service.findByCompany('comp-123');

      expect(result).toEqual(mockEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-123' },
        select: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('Business logic validation', () => {
    it('should validate unique constraints for CPF and email', async () => {
      // Test that both constraints are checked in create
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);
      const findUniqueSpy = jest.spyOn(prismaService.employee, 'findUnique')
        .mockResolvedValueOnce(null) // CPF check
        .mockResolvedValueOnce(null); // Email check

      jest.spyOn(prismaService.employee, 'create').mockResolvedValue(mockEmployee);

      await service.create(createEmployeeDto);

      expect(findUniqueSpy).toHaveBeenCalledTimes(2);
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { cpf: createEmployeeDto.cpf } });
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { email: createEmployeeDto.email } });
    });

    it('should not include password in response', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.employee, 'create').mockResolvedValue(mockEmployee);

      const result = await service.create(createEmployeeDto);

      expect(result).not.toHaveProperty('senha');
    });

    it('should validate company exists before creating employee', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.employee, 'create').mockResolvedValue(mockEmployee);

      await service.create(createEmployeeDto);

      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: createEmployeeDto.companyId },
      });
    });

    it('should check loan count before deletion', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);
      const countSpy = jest.spyOn(prismaService.loan, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.employee, 'delete').mockResolvedValue(mockEmployee);

      await service.remove('emp-123');

      expect(countSpy).toHaveBeenCalledWith({
        where: { employeeId: 'emp-123' },
      });
    });

    it('should include company and loans information in responses', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee as any);

      const result = await service.findOne('emp-123');

      expect(result.company).toBeDefined();
      expect(result.company.id).toBe('comp-123');
      expect(result.company.razaoSocial).toBe('Empresa Teste LTDA');
    });

    it('should convert salary to Decimal type', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.employee, 'create').mockResolvedValue(mockEmployee);

      await service.create(createEmployeeDto);

      expect(prismaService.employee.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salario: 5000,
        }),
        include: expect.any(Object),
      });
    });
  });
});
