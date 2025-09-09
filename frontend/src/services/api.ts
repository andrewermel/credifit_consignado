import axios from 'axios';
import { 
  Company, 
  Employee, 
  Loan, 
  CreateCompanyDto, 
  CreateEmployeeDto, 
  CreateLoanDto,
  LoanQuoteDto,
  LoanQuoteResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Companies
  companies: {
    create: (data: CreateCompanyDto): Promise<Company> =>
      api.post('/companies', data).then(res => res.data),
    
    getAll: (): Promise<Company[]> =>
      api.get('/companies').then(res => res.data),
    
    getById: (id: string): Promise<Company> =>
      api.get(`/companies/${id}`).then(res => res.data),
  },

  // Employees
  employees: {
    create: (data: CreateEmployeeDto): Promise<Employee> =>
      api.post('/employees', data).then(res => res.data),
    
    getAll: (): Promise<Employee[]> =>
      api.get('/employees').then(res => res.data),
    
    getById: (id: string): Promise<Employee> =>
      api.get(`/employees/${id}`).then(res => res.data),
  },

  // Loans
  loans: {
    quote: (data: LoanQuoteDto): Promise<LoanQuoteResponse> =>
      api.post('/loans/quote', data).then(res => res.data),
    
    create: (data: CreateLoanDto): Promise<Loan> =>
      api.post('/loans', data).then(res => res.data),
    
    getAll: (): Promise<Loan[]> =>
      api.get('/loans').then(res => res.data),
    
    getById: (id: string): Promise<Loan> =>
      api.get(`/loans/${id}`).then(res => res.data),
  },
};

export default apiService;
