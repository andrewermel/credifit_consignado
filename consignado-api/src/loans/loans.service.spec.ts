import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoansService } from './loans.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScoreService } from '../external-services/score/score.service';
import { PaymentService } from '../external-services/payment/payment.service';
import { LoanStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('LoansService', () => {
  let service: LoansService;
  let prismaService: PrismaService;
  let scoreService: ScoreService;
  let paymentService: PaymentService;

  const mockEmployee = {
    id: 'emp-123',
    nomeCompleto: 'João Silva',
    cpf: '123.456.789-01',
    email: 'joao@test.com',
    senha: 'hashed_password',
    salario: new Decimal(5000),
    companyId: 'comp-123',
    company: {
      id: 'comp-123',
      nomeEmpresa: 'Empresa Teste',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua Teste, 123',
      telefone: '(11) 99999-9999',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoan = {
    id: 'loan-123',
    valorSolicitado: new Decimal(1000),
    valorAprovado: new Decimal(1000),
    numeroParcelas: 2,
    status: LoanStatus.APPROVED,
    scoreConsultado: 650,
    dataSolicitacao: new Date(),
    dataPagamento: null,
    employeeId: 'emp-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: PrismaService,
          useValue: {
            employee: {
              findUnique: jest.fn(),
            },
            loan: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            installment: {
              create: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: ScoreService,
          useValue: {
            consultarScore: jest.fn(),
            validarScorePorSalario: jest.fn(),
            getPoliticaScore: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            processarPagamento: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    prismaService = module.get<PrismaService>(PrismaService);
    scoreService = module.get<ScoreService>(ScoreService);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('consultarCotacao', () => {
    it('should return quote for eligible employee', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);
      jest.spyOn(scoreService, 'consultarScore').mockResolvedValue(650);
      jest.spyOn(scoreService, 'validarScorePorSalario').mockReturnValue(true);

      const result = await service.consultarCotacao({ employeeId: 'emp-123' });

      expect(result.elegivel).toBe(true);
      expect(result.valorMaximo).toBe(1750); // 35% de 5000
      expect(result.margemDisponivel).toBe(1750);
      expect(result.score).toBe(650);
      expect(result.opcoesParcelas).toHaveLength(4);
      expect(result.motivoInelegibilidade).toBeUndefined();
    });

    it('should return rejection for ineligible employee', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);
      jest.spyOn(scoreService, 'consultarScore').mockResolvedValue(400);
      jest.spyOn(scoreService, 'validarScorePorSalario').mockReturnValue(false);
      jest.spyOn(scoreService, 'getPoliticaScore').mockReturnValue({
        scoreMinimo: 600,
        faixaSalarial: 'De R$ 4.001,00 até R$ 8.000,00'
      });

      const result = await service.consultarCotacao({ employeeId: 'emp-123' });

      expect(result.elegivel).toBe(false);
      expect(result.valorMaximo).toBe(1750);
      expect(result.score).toBe(400);
      expect(result.opcoesParcelas).toHaveLength(0);
      expect(result.motivoInelegibilidade).toContain('Score insuficiente');
    });

    it('should throw NotFoundException for non-existent employee', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);

      await expect(service.consultarCotacao({ employeeId: 'invalid-id' }))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createLoanDto = {
      employeeId: 'emp-123',
      valorSolicitado: 1000,
      numeroParcelas: 2,
    };

    it('should create loan successfully for eligible employee', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);
      jest.spyOn(scoreService, 'consultarScore').mockResolvedValue(650);
      jest.spyOn(scoreService, 'validarScorePorSalario').mockReturnValue(true);
      jest.spyOn(prismaService.loan, 'create').mockResolvedValue(mockLoan);
      jest.spyOn(prismaService.loan, 'findUnique').mockResolvedValue(mockLoan);
      jest.spyOn(paymentService, 'processarPagamento').mockResolvedValue({
        success: true,
        status: 'aprovado',
        message: 'Pagamento processado com sucesso'
      });
      jest.spyOn(prismaService.installment, 'create').mockResolvedValue({
        id: 'inst-123',
        loanId: 'loan-123',
        numeroParcela: 1,
        valor: new Decimal(500),
        dataVencimento: new Date(),
        status: 'PENDING' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createLoanDto);

      expect(result).toEqual(mockLoan);
      expect(prismaService.loan.create).toHaveBeenCalled();
    });

    it('should reject loan for ineligible employee', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);
      jest.spyOn(scoreService, 'consultarScore').mockResolvedValue(400);
      jest.spyOn(scoreService, 'validarScorePorSalario').mockReturnValue(false);
      jest.spyOn(scoreService, 'getPoliticaScore').mockReturnValue({
        scoreMinimo: 600,
        faixaSalarial: 'De R$ 4.001,00 até R$ 8.000,00'
      });

      const rejectedLoan = { ...mockLoan, status: LoanStatus.REJECTED };
      jest.spyOn(prismaService.loan, 'create').mockResolvedValue(rejectedLoan);

      await expect(service.create(createLoanDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw error when value exceeds available margin', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);

      const invalidDto = { ...createLoanDto, valorSolicitado: 3000 }; // Excede 35% de 5000

      await expect(service.create(invalidDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent employee', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createLoanDto))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all loans', async () => {
      const mockLoans = [mockLoan];
      jest.spyOn(prismaService.loan, 'findMany').mockResolvedValue(mockLoans);

      const result = await service.findAll();

      expect(result).toEqual(mockLoans);
      expect(prismaService.loan.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return loan by id', async () => {
      jest.spyOn(prismaService.loan, 'findUnique').mockResolvedValue(mockLoan);

      const result = await service.findOne('loan-123');

      expect(result).toEqual(mockLoan);
      expect(prismaService.loan.findUnique).toHaveBeenCalledWith({
        where: { id: 'loan-123' },
        include: {
          employee: {
            select: {
              id: true,
              nomeCompleto: true,
              cpf: true,
              email: true,
              salario: true,
              company: {
                select: {
                  id: true,
                  razaoSocial: true,
                  cnpj: true,
                },
              },
            },
          },
          installments: {
            orderBy: {
              numeroParcela: 'asc',
            },
          },
        },
      });
    });

    it('should throw NotFoundException for non-existent loan', async () => {
      jest.spyOn(prismaService.loan, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('invalid-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('Business logic validation', () => {
    it('should calculate correct margin (35% of salary)', async () => {
      const employeeWithHighSalary = { 
        ...mockEmployee, 
        salario: new Decimal(10000) 
      };
      
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(employeeWithHighSalary);
      jest.spyOn(scoreService, 'consultarScore').mockResolvedValue(750);
      jest.spyOn(scoreService, 'validarScorePorSalario').mockReturnValue(true);

      const result = await service.consultarCotacao({ employeeId: 'emp-123' });

      expect(result.valorMaximo).toBe(3500); // 35% de 10000
      expect(result.margemDisponivel).toBe(3500);
    });

    it('should validate installment options (1-4 parcelas)', async () => {
      jest.spyOn(prismaService.employee, 'findUnique').mockResolvedValue(mockEmployee);
      jest.spyOn(scoreService, 'consultarScore').mockResolvedValue(650);
      jest.spyOn(scoreService, 'validarScorePorSalario').mockReturnValue(true);

      const result = await service.consultarCotacao({ employeeId: 'emp-123' });

      expect(result.opcoesParcelas).toHaveLength(4);
      expect(result.opcoesParcelas[0].numeroParcelas).toBe(1);
      expect(result.opcoesParcelas[1].numeroParcelas).toBe(2);
      expect(result.opcoesParcelas[2].numeroParcelas).toBe(3);
      expect(result.opcoesParcelas[3].numeroParcelas).toBe(4);
    });
  });
});
