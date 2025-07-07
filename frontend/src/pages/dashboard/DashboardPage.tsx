import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: 140 }}>
            <Typography variant="h6" gutterBottom>
              Saldo Atual
            </Typography>
            <Typography variant="h4" color="primary">
              R$ 0,00
            </Typography>
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
