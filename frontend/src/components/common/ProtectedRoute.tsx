import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'CLIENTE' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redireciona para login, salvando a página que o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.perfil !== requiredRole) {
    // Se o usuário não tem o perfil necessário, redireciona para dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
