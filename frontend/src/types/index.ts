// Tipos das entidades
export interface Company {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  employees?: Employee[];
  // Aliases para compatibilidade com frontend
  name?: string;
  address?: string;
  phone?: string;
}

export interface Employee {
  id: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  salario: number;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  company?: {
    id: string;
    razaoSocial: string;
    cnpj: string;
  };
  loans?: Loan[];
}

export interface Loan {
  id: string;
  valorSolicitado: number;
  valorAprovado?: number;
  numeroParcelas: number;
  status: LoanStatus;
  scoreConsultado?: number;
  dataSolicitacao: string;
  dataPagamento?: string;
  employeeId: string;
  employee?: Employee;
  installments?: Installment[];
}

export interface Installment {
  id: string;
  numeroParcela: number;
  valor: number;
  dataVencimento: string;
  status: InstallmentStatus;
  loanId: string;
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED', 
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

// DTOs para requisições
export interface CreateCompanyDto {
  cnpj: string;
  razaoSocial: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  senha: string;
  // Compatibilidade frontend
  name?: string;
  address?: string;
  phone?: string;
}

export interface CreateEmployeeDto {
  nomeCompleto: string;
  cpf: string;
  email: string;
  senha: string;
  salario: number;
  companyId: string;
}

export interface CreateLoanDto {
  valorSolicitado: number;
  numeroParcelas: number;
  employeeId: string;
}

export interface LoanQuoteDto {
  employeeId: string;
}

export interface LoanQuoteResponse {
  valorMaximo: number;
  margemDisponivel: number;
  score: number;
  elegivel: boolean;
  motivoInelegibilidade?: string;
  opcoesParcelas: LoanOption[];
}

export interface LoanOption {
  numeroParcelas: number;
  valorParcela: number;
  dataVencimento: string;
}
