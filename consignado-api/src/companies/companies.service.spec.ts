import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock do bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('CompaniesService', () => {
  let service: CompaniesService;
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

  const createCompanyDto = {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Empresa Teste LTDA',
    nomeCompleto: 'João Silva',
    cpf: '123.456.789-01',
    email: 'joao@empresa.com',
    senha: '123456',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            employee: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
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
    it('should create a company successfully', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.company, 'create').mockResolvedValue(mockCompany);

      const result = await service.create(createCompanyDto);

      expect(result).not.toHaveProperty('senha');
      expect(result.id).toBe('comp-123');
      expect(result.email).toBe('joao@empresa.com');
      expect(prismaService.company.create).toHaveBeenCalled();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('123456', 10);
    });

    it('should throw ConflictException when CNPJ already exists', async () => {
      jest.spyOn(prismaService.company, 'findUnique')
        .mockResolvedValueOnce(mockCompany); // CNPJ check

      await expect(service.create(createCompanyDto))
        .rejects
        .toThrow(new ConflictException('CNPJ já cadastrado no sistema'));
    });

    it('should throw ConflictException when CPF already exists', async () => {
      jest.spyOn(prismaService.company, 'findUnique')
        .mockResolvedValueOnce(null) // CNPJ check
        .mockResolvedValueOnce(mockCompany); // CPF check

      await expect(service.create(createCompanyDto))
        .rejects
        .toThrow(new ConflictException('CPF já cadastrado no sistema'));
    });

    it('should throw ConflictException when email already exists', async () => {
      jest.spyOn(prismaService.company, 'findUnique')
        .mockResolvedValueOnce(null) // CNPJ check
        .mockResolvedValueOnce(null) // CPF check
        .mockResolvedValueOnce(mockCompany); // Email check

      await expect(service.create(createCompanyDto))
        .rejects
        .toThrow(new ConflictException('Email já cadastrado no sistema'));
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const mockCompanies = [mockCompany];
      jest.spyOn(prismaService.company, 'findMany').mockResolvedValue(mockCompanies as any);

      const result = await service.findAll();

      expect(result).toEqual(mockCompanies);
      expect(prismaService.company.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany as any);

      const result = await service.findOne('comp-123');

      expect(result).toEqual(mockCompany);
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'comp-123' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('invalid-id'))
        .rejects
        .toThrow(new NotFoundException('Empresa não encontrada'));
    });
  });

  describe('update', () => {
    const updateCompanyDto = {
      razaoSocial: 'Nova Empresa LTDA',
      email: 'novo@email.com',
    };

    it('should update a company successfully', async () => {
      const mockUpdatedCompany = { ...mockCompany, ...updateCompanyDto };

      // Mock findOne usado no update
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCompany as any);
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null); // No conflicts
      jest.spyOn(prismaService.company, 'update').mockResolvedValue(mockUpdatedCompany as any);

      const result = await service.update('comp-123', updateCompanyDto);

      expect(result).toEqual(mockUpdatedCompany);
      expect(prismaService.company.update).toHaveBeenCalled();
    });

    it('should hash password when updating password', async () => {
      const updateWithPassword = { ...updateCompanyDto, senha: 'newpassword' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockCompany as any);
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.company, 'update').mockResolvedValue(mockCompany as any);

      await service.update('comp-123', updateWithPassword);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });

    it('should throw ConflictException when updating to existing email', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCompany as any);
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);

      await expect(service.update('comp-123', { email: 'existing@email.com' }))
        .rejects
        .toThrow(new ConflictException('Email já cadastrado no sistema'));
    });
  });

  describe('remove', () => {
    it('should remove a company successfully when no employees linked', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCompany as any);
      jest.spyOn(prismaService.employee, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.company, 'delete').mockResolvedValue(mockCompany);

      const result = await service.remove('comp-123');

      expect(result).toEqual({ message: 'Empresa removida com sucesso' });
      expect(prismaService.company.delete).toHaveBeenCalledWith({
        where: { id: 'comp-123' },
      });
    });

    it('should throw ConflictException when employees are linked', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCompany as any);
      jest.spyOn(prismaService.employee, 'count').mockResolvedValue(2);

      await expect(service.remove('comp-123'))
        .rejects
        .toThrow(new ConflictException('Não é possível excluir a empresa. Existe(m) 2 funcionário(s) vinculado(s).'));
    });
  });

  describe('findByEmail', () => {
    it('should return company by email', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany);

      const result = await service.findByEmail('joao@empresa.com');

      expect(result).toEqual(mockCompany);
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { email: 'joao@empresa.com' },
      });
    });

    it('should return null when company not found by email', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('notfound@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findByCnpj', () => {
    it('should return company by CNPJ', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(mockCompany as any);

      const result = await service.findByCnpj('12.345.678/0001-90');

      expect(result).toEqual(mockCompany);
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { cnpj: '12.345.678/0001-90' },
        select: expect.any(Object),
      });
    });

    it('should return null when company not found by CNPJ', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);

      const result = await service.findByCnpj('00.000.000/0000-00');

      expect(result).toBeNull();
    });
  });

  describe('Business logic validation', () => {
    it('should validate unique constraints for CNPJ, CPF, and email', async () => {
      // Test that all three constraints are checked in create
      const findUniqueSpy = jest.spyOn(prismaService.company, 'findUnique')
        .mockResolvedValueOnce(null) // CNPJ check
        .mockResolvedValueOnce(null) // CPF check  
        .mockResolvedValueOnce(null); // Email check

      jest.spyOn(prismaService.company, 'create').mockResolvedValue(mockCompany);

      await service.create(createCompanyDto);

      expect(findUniqueSpy).toHaveBeenCalledTimes(3);
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { cnpj: createCompanyDto.cnpj } });
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { cpf: createCompanyDto.cpf } });
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { email: createCompanyDto.email } });
    });

    it('should not include password in response', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.company, 'create').mockResolvedValue(mockCompany);

      const result = await service.create(createCompanyDto);

      expect(result).not.toHaveProperty('senha');
    });

    it('should check employee count before deletion', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCompany as any);
      const countSpy = jest.spyOn(prismaService.employee, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.company, 'delete').mockResolvedValue(mockCompany);

      await service.remove('comp-123');

      expect(countSpy).toHaveBeenCalledWith({
        where: { companyId: 'comp-123' },
      });
    });
  });
});
