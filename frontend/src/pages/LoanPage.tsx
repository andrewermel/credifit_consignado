import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { Loan, Employee, CreateLoanDto } from '../types';

const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div<{ $status: string }>`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid ${props => getStatusColor(props.$status)};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
`;

const StatusBadge = styled.span<{ status: string }>`
  background-color: ${props => getStatusColor(props.status)};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
`;

const CardInfo = styled.p`
  margin: 0.5rem 0;
  color: #666;
  
  strong {
    color: #2c3e50;
  }
`;

const ValueInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
`;

const ValueItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
`;

const ValueLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const ValueAmount = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const SecondaryButton = styled(Button)`
  background-color: #95a5a6;

  &:hover {
    background-color: #7f8c8d;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
`;

const SuccessMessage = styled.div`
  background-color: #27ae60;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED':
      return '#27ae60';
    case 'PENDING':
      return '#f39c12';
    case 'REJECTED':
      return '#e74c3c';
    case 'PAID':
      return '#3498db';
    default:
      return '#95a5a6';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'Aprovado';
    case 'PENDING':
      return 'Pendente';
    case 'REJECTED':
      return 'Rejeitado';
    case 'PAID':
      return 'Pago';
    default:
      return status;
  }
}

export const LoanPage: React.FC = () => {
  const location = useLocation();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateLoanDto>({
    valorSolicitado: 0,
    numeroParcelas: 1,
    employeeId: '',
  });

  useEffect(() => {
    loadData();
    
    // Verificar se há mensagem de sucesso do redirecionamento
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      // Limpar a mensagem após 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansData, employeesData] = await Promise.all([
        apiService.loans.getAll(),
        apiService.employees.getAll(),
      ]);
      setLoans(loansData);
      setEmployees(employeesData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.loans.create(formData);
      setShowModal(false);
      setFormData({
        valorSolicitado: 0,
        numeroParcelas: 1,
        employeeId: '',
      });
      loadData();
    } catch (err) {
      setError('Erro ao criar empréstimo');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valorSolicitado' ? parseFloat(value) || 0 : 
              name === 'numeroParcelas' ? parseInt(value) || 1 : value
    }));
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

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.nomeCompleto || 'N/A';
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Carregando empréstimos...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Empréstimos</Title>
        <Button onClick={() => setShowModal(true)}>
          Novo Empréstimo
        </Button>
      </Header>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loans.length === 0 ? (
        <LoadingMessage>Nenhum empréstimo encontrado</LoadingMessage>
      ) : (
        <Grid>
          {loans.map(loan => (
            <Card key={loan.id} $status={loan.status}>
              <CardHeader>
                <CardTitle>Empréstimo #{loan.id.slice(-8)}</CardTitle>
                <StatusBadge status={loan.status}>
                  {getStatusLabel(loan.status)}
                </StatusBadge>
              </CardHeader>

              <CardInfo>
                <strong>Funcionário:</strong> {getEmployeeName(loan.employeeId)}
              </CardInfo>

              <ValueInfo>
                <ValueItem>
                  <ValueLabel>Valor Solicitado</ValueLabel>
                  <ValueAmount>{formatCurrency(loan.valorSolicitado)}</ValueAmount>
                </ValueItem>
                {loan.valorAprovado && (
                  <ValueItem>
                    <ValueLabel>Valor Aprovado</ValueLabel>
                    <ValueAmount>{formatCurrency(loan.valorAprovado)}</ValueAmount>
                  </ValueItem>
                )}
              </ValueInfo>

              <CardInfo>
                <strong>Parcelas:</strong> {loan.numeroParcelas}x
              </CardInfo>

              {loan.scoreConsultado && (
                <CardInfo>
                  <strong>Score:</strong> {loan.scoreConsultado}
                </CardInfo>
              )}

              <CardInfo>
                <strong>Data Solicitação:</strong> {formatDate(loan.dataSolicitacao)}
              </CardInfo>

              {loan.dataPagamento && (
                <CardInfo>
                  <strong>Data Pagamento:</strong> {formatDate(loan.dataPagamento)}
                </CardInfo>
              )}
            </Card>
          ))}
        </Grid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Novo Empréstimo</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Funcionário</Label>
                <Select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nomeCompleto} - {formatCurrency(employee.salario)}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Valor Solicitado</Label>
                <Input
                  type="number"
                  name="valorSolicitado"
                  value={formData.valorSolicitado}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Número de Parcelas</Label>
                <Select
                  name="numeroParcelas"
                  value={formData.numeroParcelas}
                  onChange={handleInputChange}
                  required
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                  <option value={4}>4x</option>
                </Select>
              </FormGroup>

              <ButtonGroup>
                <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </SecondaryButton>
                <Button type="submit">
                  Criar Empréstimo
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};
