import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CompanyPage } from './pages/CompanyPage';
import { EmployeePage } from './pages/EmployeePage';
import { LoanPage } from './pages/LoanPage';
import { LoanQuotePage } from './pages/LoanQuotePage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<CompanyPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/loans" element={<LoanPage />} />
          <Route path="/loans/quote" element={<LoanQuotePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
