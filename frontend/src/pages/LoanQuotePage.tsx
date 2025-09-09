import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { Employee, LoanQuoteResponse, LoanQuoteDto, CreateLoanDto } from '../types';

const Container = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ResultCard = styled.div`
  background: #f8f9fa;
  border: 2px solid #27ae60;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const RejectedCard = styled.div`
  background: #f8f9fa;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const ResultTitle = styled.h3`
  color: #27ae60;
  margin: 0 0 1rem 0;
`;

const RejectedTitle = styled.h3`
  color: #e74c3c;
  margin: 0 0 1rem 0;
`;

const ResultInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
`;

const OptionsTitle = styled.h4`
  color: #2c3e50;
  margin: 1.5rem 0 1rem 0;
`;

const OptionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const OptionCard = styled.div<{ $selected?: boolean }>`
  background: white;
  border: 2px solid ${props => props.$selected ? '#3498db' : '#ddd'};
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: #3498db;
    background-color: ${props => props.$selected ? '#e3f2fd' : '#f8f9fa'};
  }

  ${props => props.$selected && `
    background-color: #e3f2fd;
  `}
`;

const LoanOptionsSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const SectionTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
`;

const ValueSelector = styled.div`
  margin-bottom: 1.5rem;
`;

const RangeInput = styled.input`
  width: 100%;
  margin: 1rem 0;
`;

const ValueDisplay = styled.div`
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 1rem;
`;

const CreateLoanButton = styled(Button)`
  background-color: #27ae60;
  font-size: 1.2rem;
  padding: 1rem 2rem;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: #229954;
  }

  &:disabled {
    background-color: #95a5a6;
  }
`;

const OptionTitle = styled.div`
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const OptionValue = styled.div`
  font-size: 1.1rem;
  color: #27ae60;
  font-weight: bold;
`;

const OptionDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

export const LoanQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedParcelas, setSelectedParcelas] = useState<number>(1);
  const [selectedValor, setSelectedValor] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [creatingLoan, setCreatingLoan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<LoanQuoteResponse | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await apiService.employees.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar funcionários');
      console.error(err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId) {
      setError('Selecione um funcionário');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const quoteData: LoanQuoteDto = {
        employeeId: selectedEmployeeId
      };
      
      const result = await apiService.loans.quote(quoteData);
      setQuote(result);
      
      // Resetar seleção de parcelas quando nova simulação
      if (result.elegivel && result.opcoesParcelas.length > 0) {
        setSelectedParcelas(result.opcoesParcelas[0].numeroParcelas);
        setSelectedValor(result.valorMaximo);
      }
    } catch (err) {
      setError('Erro ao simular empréstimo');
      console.error(err);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async () => {
    if (!selectedEmployeeId || !selectedValor || !selectedParcelas) {
      setError('Dados incompletos para criar empréstimo');
      return;
    }

    try {
      setCreatingLoan(true);
      setError(null);

      const loanData: CreateLoanDto = {
        employeeId: selectedEmployeeId,
        valorSolicitado: selectedValor,
        numeroParcelas: selectedParcelas,
      };

      await apiService.loans.create(loanData);
      
      // Redirecionar para página de empréstimos com sucesso
      navigate('/loans', { 
        state: { 
          message: 'Empréstimo solicitado com sucesso!',
          type: 'success' 
        }
      });
    } catch (err) {
      setError('Erro ao criar empréstimo');
      console.error(err);
    } finally {
      setCreatingLoan(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSelectedEmployee = () => {
    return employees.find(emp => emp.id === selectedEmployeeId);
  };

  // Função para calcular parcelas dinamicamente baseado no valor selecionado
  const calculateDynamicInstallments = () => {
    if (!quote?.elegivel || !selectedValor) return [];
    
    return quote.opcoesParcelas.map(option => ({
      ...option,
      valorParcela: selectedValor / option.numeroParcelas
    }));
  };

  if (loadingEmployees) {
    return (
      <Container>
        <LoadingMessage>Carregando funcionários...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Simular Empréstimo Consignado</Title>

      <Card>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Selecione o Funcionário</Label>
            <Select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              required
            >
              <option value="">Escolha um funcionário</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.nomeCompleto} - {formatCurrency(employee.salario)}
                </option>
              ))}
            </Select>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Simulando...' : 'Simular Empréstimo'}
          </Button>
        </Form>
      </Card>

      {quote && (
        <>
          {quote.elegivel ? (
            <ResultCard>
              <ResultTitle>✅ Empréstimo Aprovado!</ResultTitle>
              
              <ResultInfo>
                <InfoItem>
                  <InfoLabel>Valor Máximo</InfoLabel>
                  <InfoValue>{formatCurrency(quote.valorMaximo)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Margem Disponível</InfoLabel>
                  <InfoValue>{formatCurrency(quote.margemDisponivel)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Score</InfoLabel>
                  <InfoValue>{quote.score}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Salário do Funcionário</InfoLabel>
                  <InfoValue>{formatCurrency(getSelectedEmployee()?.salario || 0)}</InfoValue>
                </InfoItem>
              </ResultInfo>

              <OptionsTitle>Opções de Parcelamento</OptionsTitle>
              <OptionsList>
                {calculateDynamicInstallments().map((option, index) => (
                  <OptionCard 
                    key={index}
                    $selected={selectedParcelas === option.numeroParcelas}
                    onClick={() => setSelectedParcelas(option.numeroParcelas)}
                  >
                    <OptionTitle>{option.numeroParcelas}x</OptionTitle>
                    <OptionValue>{formatCurrency(option.valorParcela)}</OptionValue>
                    <OptionDate>Primeiro vencimento: {formatDate(option.dataVencimento)}</OptionDate>
                  </OptionCard>
                ))}
              </OptionsList>

              <LoanOptionsSection>
                <SectionTitle>Configurar Empréstimo</SectionTitle>
                
                <ValueSelector>
                  <label>Valor do Empréstimo: </label>
                  <ValueDisplay>{formatCurrency(selectedValor)}</ValueDisplay>
                  <RangeInput
                    type="range"
                    min="100"
                    max={quote.valorMaximo}
                    step="50"
                    value={selectedValor}
                    onChange={(e) => setSelectedValor(parseFloat(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                    <span>R$ 100,00</span>
                    <span>{formatCurrency(quote.valorMaximo)}</span>
                  </div>
                </ValueSelector>

                <CreateLoanButton 
                  onClick={handleCreateLoan} 
                  disabled={creatingLoan}
                >
                  {creatingLoan ? 'Solicitando...' : 'Solicitar Empréstimo'}
                </CreateLoanButton>
              </LoanOptionsSection>
            </ResultCard>
          ) : (
            <RejectedCard>
              <RejectedTitle>❌ Empréstimo Negado</RejectedTitle>
              <div>
                <strong>Motivo:</strong> {quote.motivoInelegibilidade}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <strong>Score consultado:</strong> {quote.score}
              </div>
              {getSelectedEmployee() && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Salário:</strong> {formatCurrency(getSelectedEmployee()!.salario)}
                </div>
              )}
            </RejectedCard>
          )}
        </>
      )}
    </Container>
  );
};
