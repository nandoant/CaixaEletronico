import React from 'react';
import {
  Paper,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

interface ContaInfo {
  contaId: number;
  numeroConta: string;
  titular: string;
  usuarioProprietario: string;
  usuarioProprietarioId: number;
  saldo: number;
}

interface PeriodoInfo {
  dataInicio: string;
  dataFim: string;
}

interface ExtratoResumoProps {
  conta: ContaInfo;
  periodo: PeriodoInfo;
  totalOperacoes: number;
  valorTotalMovimentado?: number;
}

const ExtratoResumo: React.FC<ExtratoResumoProps> = ({
  conta,
  periodo,
  totalOperacoes,
  valorTotalMovimentado = 0
}) => {
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarPeriodo = (): string => {
    const inicio = formatarData(periodo.dataInicio);
    const fim = formatarData(periodo.dataFim);
    return `${inicio} até ${fim}`;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
        Resumo do Extrato
      </Typography>

      <Grid container spacing={3}>
        {/* Informações da Conta */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Informações da Conta
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Número da Conta
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {conta.numeroConta}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Titular
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body1" fontWeight="medium">
                    {conta.titular}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Saldo Atual
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  color="success.main"
                >
                  {formatarMoeda(conta.saldo)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumo do Período */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Resumo do Período
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Período Consultado
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatarPeriodo()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total de Operações
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {totalOperacoes}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={totalOperacoes === 1 ? "operação" : "operações"}
                    variant="outlined"
                  />
                </Box>
              </Box>

              {valorTotalMovimentado > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total Movimentado
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    color="info.main"
                  >
                    {formatarMoeda(valorTotalMovimentado)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExtratoResumo;
