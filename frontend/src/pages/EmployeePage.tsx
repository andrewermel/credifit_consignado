import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { Employee, Company, CreateEmployeeDto } from '../types';

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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
`;

const CardInfo = styled.p`
  margin: 0.5rem 0;
  color: #666;
  
  strong {
    color: #2c3e50;
  }
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

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SalaryBadge = styled.span`
  background-color: #27ae60;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
`;

export const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeDto>({
    nomeCompleto: '',
    cpf: '',
    email: '',
    senha: '',
    salario: 0,
    companyId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, companiesData] = await Promise.all([
        apiService.employees.getAll(),
        apiService.companies.getAll(),
      ]);
      setEmployees(employeesData);
      setCompanies(companiesData);
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
      await apiService.employees.create(formData);
      setShowModal(false);
      setFormData({
        nomeCompleto: '',
        cpf: '',
        email: '',
        senha: '',
        salario: 0,
        companyId: '',
      });
      loadData();
    } catch (err) {
      setError('Erro ao cadastrar funcionário');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salario' ? parseFloat(value) || 0 : value
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.razaoSocial || 'N/A';
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Carregando funcionários...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Funcionários</Title>
        <Button onClick={() => setShowModal(true)}>
          Novo Funcionário
        </Button>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {employees.length === 0 ? (
        <LoadingMessage>Nenhum funcionário cadastrado</LoadingMessage>
      ) : (
        <Grid>
          {employees.map(employee => (
            <Card key={employee.id}>
              <CardTitle>{employee.nomeCompleto}</CardTitle>
              <CardInfo><strong>CPF:</strong> {employee.cpf}</CardInfo>
              <CardInfo><strong>Email:</strong> {employee.email}</CardInfo>
              <CardInfo>
                <strong>Salário:</strong> <SalaryBadge>{formatCurrency(employee.salario)}</SalaryBadge>
              </CardInfo>
              <CardInfo><strong>Empresa:</strong> {getCompanyName(employee.companyId)}</CardInfo>
            </Card>
          ))}
        </Grid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>Novo Funcionário</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nome Completo</Label>
                <Input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>CPF</Label>
                <Input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Senha</Label>
                <Input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Salário</Label>
                <Input
                  type="number"
                  name="salario"
                  value={formData.salario}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Empresa</Label>
                <Select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.razaoSocial}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <ButtonGroup>
                <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </SecondaryButton>
                <Button type="submit">
                  Cadastrar
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};
