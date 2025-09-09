import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: ${props => props.$active ? 'rgba(255,255,255,0.2)' : 'transparent'};
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>Credifit Consignado</Logo>
          <Nav>
            <NavLink to="/" $active={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/companies" $active={isActive('/companies')}>
              Empresas
            </NavLink>
            <NavLink to="/employees" $active={isActive('/employees')}>
              Funcionários
            </NavLink>
            <NavLink to="/loans/quote" $active={isActive('/loans/quote')}>
              Simular Empréstimo
            </NavLink>
            <NavLink to="/loans" $active={isActive('/loans')}>
              Empréstimos
            </NavLink>
          </Nav>
        </HeaderContent>
      </Header>
      <Main>
        {children}
      </Main>
    </Container>
  );
};
