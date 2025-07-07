import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import { useConta } from '../../hooks/useConta';

const DashboardPage: React.FC = () => {
  const { saldoFormatado, isLoading, error } = useConta();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Saldo Atual
            </Typography>
            {error ? (
              <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
                Erro ao carregar saldo
              </Alert>
            ) : isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Carregando...</Typography>
              </Box>
            ) : (
              <Typography variant="h4" color="primary">
                {saldoFormatado}
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: 140 }}>
            <Typography variant="h6" gutterBottom>
              Últimas Operações
            </Typography>
            <Typography variant="body2">
              Nenhuma operação recente
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: 140 }}>
            <Typography variant="h6" gutterBottom>
              Agendamentos
            </Typography>
            <Typography variant="body2">
              Nenhum agendamento pendente
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
