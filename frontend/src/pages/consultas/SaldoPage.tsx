import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { Refresh as RefreshIcon, AccountBalance as AccountIcon } from '@mui/icons-material';
import { useConta } from '../../hooks/useConta';

const SaldoPage: React.FC = () => {
  const { 
    conta, 
    saldoFormatado, 
    numeroConta, 
    titular, 
    dataUltimaConsulta,
    isLoading, 
    error, 
    refreshSaldo 
  } = useConta();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSaldo();
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error && !conta) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Consulta de Saldo
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Consulta de Saldo
        </Typography>
        <Button 
          variant="outlined" 
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          startIcon={isLoading || isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        >
          {isLoading || isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Card principal do saldo */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}>
            <AccountIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
            <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
              Saldo Disponível
            </Typography>
            {isLoading && !conta ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
                <CircularProgress color="inherit" size={30} />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Consultando saldo...
                </Typography>
              </Box>
            ) : (
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                {saldoFormatado}
              </Typography>
            )}
            {conta && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Última atualização: {dataUltimaConsulta}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Informações da conta */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Informações da Conta
            </Typography>
            
            {conta ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Número da Conta
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {numeroConta}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Titular
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {titular}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Tipo de Usuário
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={conta.usuarioProprietario.toUpperCase()} 
                      color="primary" 
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={24} sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  Carregando informações...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SaldoPage;
