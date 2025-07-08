import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import OperacoesPage from "../pages/operacoes/OperacoesPage";
import DepositoPage from "../pages/operacoes/DepositoPage";
import SaquePage from "../pages/operacoes/SaquePage";
import TransferenciaPage from "../pages/operacoes/TransferenciaPage";
import AgendamentoPage from "../pages/operacoes/AgendamentoPage";
import PagamentoAgendadoPage from "../pages/operacoes/PagamentoAgendadoPage";
import ExtratoPage from "../pages/consultas/ExtratoPage";
import SaldoPage from "../pages/consultas/SaldoPage";
import AgendamentosPage from "../pages/agendamentos/AgendamentosPage";
import AdminPage from "../pages/admin/AdminPage";
import Layout from "../components/layout/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="operacoes" element={<OperacoesPage />} />
        <Route path="operacoes/deposito" element={<DepositoPage />} />
        <Route path="operacoes/saque" element={<SaquePage />} />
        <Route path="operacoes/transferencia" element={<TransferenciaPage />} />
        <Route path="operacoes/agendamento" element={<AgendamentoPage />} />
        <Route path="operacoes/pagamento-agendado" element={<PagamentoAgendadoPage />} />
        <Route path="extrato" element={<ExtratoPage />} />
        <Route path="saldo" element={<SaldoPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />

        {/* Rota admin - apenas para admins */}
        <Route 
          path="admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
