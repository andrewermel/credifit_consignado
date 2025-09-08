import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoreService } from '../external-services/score/score.service';
import { PaymentService } from '../external-services/payment/payment.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanQuoteDto } from './dto/loan-quote.dto';
import { LoanQuoteResponseDto, LoanOptionDto } from './dto/loan-quote-response.dto';
import { LoanStatus, InstallmentStatus } from '@prisma/client';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private scoreService: ScoreService,
    private paymentService: PaymentService,
  ) {}

  /**
   * Consulta cotação de empréstimo para um funcionário
   */
  async consultarCotacao(loanQuoteDto: LoanQuoteDto): Promise<LoanQuoteResponseDto> {
    // Buscar dados do funcionário
    const employee = await this.prisma.employee.findUnique({
      where: { id: loanQuoteDto.employeeId },
      include: { company: true },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Calcular margem disponível (35% do salário)
    const margemDisponivel = Number(employee.salario) * 0.35;

    // Consultar score de crédito
    const score = await this.scoreService.consultarScore(employee.cpf);

    // Verificar elegibilidade
    const elegivel = this.scoreService.validarScorePorSalario(score, Number(employee.salario));
    const politicaScore = this.scoreService.getPoliticaScore(Number(employee.salario));

    const response: LoanQuoteResponseDto = {
      valorMaximo: margemDisponivel,
      margemDisponivel,
      score,
      elegivel,
      opcoesParcelas: [],
    };

    if (!elegivel) {
      response.motivoInelegibilidade = `Score insuficiente. Necessário: ${politicaScore.scoreMinimo}, Atual: ${score}`;
      return response;
    }

    // Gerar opções de parcelamento (1 a 4 parcelas)
    response.opcoesParcelas = this.gerarOpcoesParcelas(margemDisponivel);

    return response;
  }

  /**
   * Criar solicitação de empréstimo
   */
  async create(createLoanDto: CreateLoanDto) {
    // Buscar dados do funcionário
    const employee = await this.prisma.employee.findUnique({
      where: { id: createLoanDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Validar margem disponível
    const margemDisponivel = Number(employee.salario) * 0.35;
    if (createLoanDto.valorSolicitado > margemDisponivel) {
      throw new BadRequestException(
        `Valor solicitado (R$ ${createLoanDto.valorSolicitado}) excede a margem disponível (R$ ${margemDisponivel.toFixed(2)})`
      );
    }

    // Consultar score
    const score = await this.scoreService.consultarScore(employee.cpf);

    // Validar score
    const elegivel = this.scoreService.validarScorePorSalario(score, Number(employee.salario));
    
    if (!elegivel) {
      const politicaScore = this.scoreService.getPoliticaScore(Number(employee.salario));
      
      // Criar empréstimo rejeitado
      const loanRejected = await this.prisma.loan.create({
        data: {
          valorSolicitado: createLoanDto.valorSolicitado,
          numeroParcelas: createLoanDto.numeroParcelas,
          employeeId: createLoanDto.employeeId,
          status: LoanStatus.REJECTED,
          scoreConsultado: score,
        },
      });

      throw new BadRequestException(
        `Empréstimo rejeitado. Score insuficiente. Necessário: ${politicaScore.scoreMinimo}, Atual: ${score}`
      );
    }

    // Criar empréstimo aprovado
    const loan = await this.prisma.loan.create({
      data: {
        valorSolicitado: createLoanDto.valorSolicitado,
        valorAprovado: createLoanDto.valorSolicitado,
        numeroParcelas: createLoanDto.numeroParcelas,
        employeeId: createLoanDto.employeeId,
        status: LoanStatus.APPROVED,
        scoreConsultado: score,
      },
    });

    // Gerar parcelas
    await this.gerarParcelas(loan.id, createLoanDto.valorSolicitado, createLoanDto.numeroParcelas);

    // Processar pagamento
    try {
      const paymentResult = await this.paymentService.processarPagamento({
        valor: createLoanDto.valorSolicitado,
        employeeId: createLoanDto.employeeId,
        loanId: loan.id,
      });

      if (paymentResult.success) {
        // Atualizar empréstimo como pago
        await this.prisma.loan.update({
          where: { id: loan.id },
          data: {
            status: LoanStatus.PAID,
            dataPagamento: new Date(),
          },
        });
      }
    } catch (error) {
      // Log do erro, mas não falha a criação do empréstimo
      console.error('Erro no processamento do pagamento:', error);
    }

    return this.findOne(loan.id);
  }

  /**
   * Listar todos os empréstimos
   */
  async findAll() {
    return this.prisma.loan.findMany({
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
        installments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Buscar empréstimo por ID
   */
  async findOne(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
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

    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    return loan;
  }

  /**
   * Atualizar empréstimo
   */
  async update(id: string, updateLoanDto: UpdateLoanDto) {
    const loan = await this.findOne(id);
    
    return this.prisma.loan.update({
      where: { id },
      data: updateLoanDto,
    });
  }

  /**
   * Remover empréstimo
   */
  async remove(id: string) {
    await this.findOne(id);
    
    return this.prisma.loan.delete({
      where: { id },
    });
  }

  /**
   * Gerar opções de parcelamento
   */
  private gerarOpcoesParcelas(valorMaximo: number): LoanOptionDto[] {
    const opcoes: LoanOptionDto[] = [];
    const hoje = new Date();

    for (let parcelas = 1; parcelas <= 4; parcelas++) {
      const valorParcela = valorMaximo / parcelas;
      const dataVencimento = new Date(hoje);
      dataVencimento.setMonth(dataVencimento.getMonth() + 1); // Primeiro vencimento: +1 mês

      opcoes.push({
        numeroParcelas: parcelas,
        valorParcela: Math.round(valorParcela * 100) / 100, // Arredondar para 2 casas decimais
        dataVencimento,
      });
    }

    return opcoes;
  }

  /**
   * Gerar parcelas do empréstimo
   */
  private async gerarParcelas(loanId: string, valorTotal: number, numeroParcelas: number) {
    const valorParcela = valorTotal / numeroParcelas;
    const hoje = new Date();

    for (let i = 1; i <= numeroParcelas; i++) {
      const dataVencimento = new Date(hoje);
      dataVencimento.setMonth(dataVencimento.getMonth() + i);

      await this.prisma.installment.create({
        data: {
          loanId,
          numeroParcela: i,
          valor: Math.round(valorParcela * 100) / 100,
          dataVencimento,
          status: InstallmentStatus.PENDING,
        },
      });
    }
  }
}
