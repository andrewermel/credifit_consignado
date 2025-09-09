# 🏦 Credifit - Sistema de Crédito Consignado

Sistema completo para gestão de empréstimos consignados desenvolvido para o desafio técnico da Credifit.

## 🚀 Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **Swagger** - Documentação da API
- **Docker** - Containerização

### Frontend (Em desenvolvimento)
- **React** - Biblioteca frontend
- **TypeScript** - Linguagem de programação
- **Axios** - Cliente HTTP

## 🏗️ Estrutura do Projeto

```
credifit_consignado/
├── consignado-api/          # Backend NestJS
│   ├── src/
│   │   ├── companies/       # Módulo de empresas
│   │   ├── employees/       # Módulo de funcionários
│   │   ├── loans/          # Módulo de empréstimos
│   │   ├── external-services/ # Serviços externos (Score/Payment)
│   │   └── prisma/         # Configuração Prisma
│   ├── prisma/             # Schema e migrações
│   └── ...
├── docker-compose.yml      # PostgreSQL container
└── PASSO_A_PASSO.md       # Guia de desenvolvimento
```

## 📋 Funcionalidades Implementadas

- ✅ **Estrutura base do NestJS**
- ✅ **Modelagem do banco de dados (Prisma)**
- ✅ **Configuração do PostgreSQL**
- ✅ **Módulos CRUD completos para Companies, Employees e Loans**
- ✅ **Services implementados com validações de negócio**
- ✅ **Documentação automática com Swagger**
- ✅ **Configuração de variáveis de ambiente**
- ✅ **Integração com APIs externas (Score e Payment)**
- ✅ **Sistema completo de empréstimos consignados**
- ✅ **Criptografia de senhas com bcrypt**
- ✅ **Validações de unicidade (CNPJ, CPF, email)**
- ✅ **Tratamento de erros e relacionamentos**

## 🔧 Como Executar

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/andrewermel/credifit_consignado.git
cd credifit_consignado
```

### 2. Configure o banco de dados
```bash
# Subir PostgreSQL com Docker
docker-compose up -d postgres

# Ou configure manualmente no .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/credifit_consignado?schema=public"
```

### 3. Instale as dependências e execute
```bash
cd consignado-api
npm install
npx prisma migrate dev
npm run start:dev
```

### 4. Acesse a aplicação
- **API**: http://localhost:3000
- **Documentação**: http://localhost:3000/api/docs

## 📊 Modelo de Dados

### Entidades Principais

- **Company** - Empresas conveniadas
- **Employee** - Funcionários das empresas
- **Loan** - Empréstimos solicitados
- **Installment** - Parcelas dos empréstimos

### Regras de Negócio

- Margem máxima de consignado: 35% do salário
- Política de score por faixa salarial:
  - Até R$ 2.000 → Score mín. 400
  - Até R$ 4.000 → Score mín. 500
  - Até R$ 8.000 → Score mín. 600
  - Até R$ 12.000 → Score mín. 700

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📚 Documentação da API

A documentação completa da API está disponível em `/api/docs` quando o servidor estiver rodando.

## 🚧 Próximos Passos

- [ ] Criar frontend React
- [ ] Implementar testes automatizados
- [ ] Melhorias na documentação
- [ ] Deploy e containerização completa
- [ ] Implementar autenticação JWT
- [ ] Cache e otimizações de performance

## 🧪 Endpoints Disponíveis

### 🏢 **Empresas**
- `POST /companies` - Criar empresa
- `GET /companies` - Listar empresas
- `GET /companies/:id` - Buscar empresa
- `PATCH /companies/:id` - Atualizar empresa
- `DELETE /companies/:id` - Remover empresa

### 👤 **Funcionários**
- `POST /employees` - Criar funcionário
- `GET /employees` - Listar funcionários
- `GET /employees/:id` - Buscar funcionário
- `PATCH /employees/:id` - Atualizar funcionário
- `DELETE /employees/:id` - Remover funcionário

### 💰 **Empréstimos**
- `POST /loans/quote` - Consultar cotação
- `POST /loans` - Solicitar empréstimo
- `GET /loans` - Listar empréstimos
- `GET /loans/:id` - Detalhes do empréstimo
- `PATCH /loans/:id` - Atualizar empréstimo
- `DELETE /loans/:id` - Remover empréstimo

## 👨‍💻 Desenvolvido por

Andrew Ermel - Desafio técnico Credifit 2025

---

**Status**: � **FUNCIONAL** - Backend completo implementado e testado

### 🎯 **Principais Recursos:**
- **Sistema completo de empréstimos consignados**
- **Validação automática por score e salário**
- **Margem de 35% do salário**
- **Parcelamento de 1 a 4x**
- **Integração com APIs externas**
- **Documentação Swagger completa**
- **Validações de segurança implementadas**
