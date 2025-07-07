import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OperacoesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Operações
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Saque
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Retirar dinheiro da sua conta
            </Typography>
            <Button variant="contained" fullWidth>
              Fazer Saque
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Depósito
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Depositar dinheiro na sua conta
            </Typography>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => navigate('/operacoes/deposito')}
            >
              Fazer Depósito
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Transferência
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Transferir para outra conta
            </Typography>
            <Button variant="contained" fullWidth>
              Fazer Transferência
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OperacoesPage;
