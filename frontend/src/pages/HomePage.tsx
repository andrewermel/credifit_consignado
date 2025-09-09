import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 3rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled(Link)`
  display: block;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const CardTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const CardDescription = styled.p`
  color: #666;
  line-height: 1.5;
`;

export const HomePage: React.FC = () => {
  return (
    <Container>
      <Title>Sistema de Crédito Consignado</Title>
      <Subtitle>
        Gerencie empréstimos consignados de forma simples e eficiente
      </Subtitle>

      <CardGrid>
        <Card to="/companies">
          <CardTitle>🏢 Empresas</CardTitle>
          <CardDescription>
            Cadastre e gerencie empresas parceiras no sistema de crédito consignado.
          </CardDescription>
        </Card>

        <Card to="/employees">
          <CardTitle>👥 Funcionários</CardTitle>
          <CardDescription>
            Cadastre funcionários e visualize informações sobre elegibilidade para empréstimos.
          </CardDescription>
        </Card>

        <Card to="/loans/quote">
          <CardTitle>💰 Simular Empréstimo</CardTitle>
          <CardDescription>
            Simule empréstimos consignados e verifique as condições disponíveis.
          </CardDescription>
        </Card>

        <Card to="/loans">
          <CardTitle>📋 Empréstimos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os empréstimos ativos no sistema.
          </CardDescription>
        </Card>
      </CardGrid>
    </Container>
  );
};
