import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Banknote, DepositoRequest, TipoCedula, Cedulas } from '../../types/operacoes';
import { operacoesService } from '../../services/operacoesService';

// Available banknotes for deposit
const AVAILABLE_BANKNOTES: Banknote[] = [
  { value: 200, quantity: 0 },
  { value: 100, quantity: 0 },
  { value: 50, quantity: 0 },
  { value: 20, quantity: 0 },
  { value: 10, quantity: 0 },
  { value: 5, quantity: 0 },
  { value: 2, quantity: 0 }
];

const steps = [
  'Seleção de Cédulas',
  'Confirmação',
  'Finalização'
];

export const DepositoPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [banknotes, setBanknotes] = useState<Banknote[]>(AVAILABLE_BANKNOTES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total value automatically when banknotes change
  const totalValue = banknotes.reduce((total, banknote) => 
    total + (banknote.value * banknote.quantity), 0
  );

  // Check if any banknotes are selected
  const hasSelectedBanknotes = banknotes.some(banknote => banknote.quantity > 0);

  // Convert banknotes array to Cedulas format for backend
  const convertBanknotesToCedulas = (banknotes: Banknote[]): Cedulas => {
    const cedulas: Cedulas = {};
    
    banknotes.forEach(banknote => {
      if (banknote.quantity > 0) {
        switch (banknote.value) {
          case 2:
            cedulas[TipoCedula.DOIS] = banknote.quantity;
            break;
          case 5:
            cedulas[TipoCedula.CINCO] = banknote.quantity;
            break;
          case 10:
            cedulas[TipoCedula.DEZ] = banknote.quantity;
            break;
          case 20:
            cedulas[TipoCedula.VINTE] = banknote.quantity;
            break;
          case 50:
            cedulas[TipoCedula.CINQUENTA] = banknote.quantity;
            break;
          case 100:
            cedulas[TipoCedula.CEM] = banknote.quantity;
            break;
          case 200:
            cedulas[TipoCedula.DUZENTOS] = banknote.quantity;
            break;
        }
      }
    });
    
    return cedulas;
  };

  const handleBanknoteQuantityChange = (value: number, quantity: string) => {
    const numQuantity = parseInt(quantity) || 0;
    if (numQuantity < 0) return;

    setBanknotes(prev => 
      prev.map(banknote => 
        banknote.value === value 
          ? { ...banknote, quantity: numQuantity }
          : banknote
      )
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !hasSelectedBanknotes) {
      setError('Selecione pelo menos uma cédula para depositar');
      return;
    }
    
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDeposito = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert banknotes to the format expected by the backend
      const cedulas = convertBanknotesToCedulas(banknotes);
      
      const depositoRequest: DepositoRequest = {
        contaId: 1, // TODO: Get from user context/auth when integrated
        valor: totalValue,
        cedulas: cedulas
      };

      // TODO: Integrate with backend
      // This is currently using a mock service
      // Future integration: POST /operacoes/deposito
      await operacoesService.realizarDeposito(depositoRequest);
      
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar depósito');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBanknotes(AVAILABLE_BANKNOTES);
    setActiveStep(0);
    setError(null);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecione as cédulas que deseja depositar:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {banknotes.map((banknote) => (
                <Grid item xs={12} sm={6} md={4} key={banknote.value}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      '&:hover': { 
                        boxShadow: 2,
                        borderColor: 'primary.main' 
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="primary">
                          R$ {banknote.value}
                        </Typography>
                      </Box>
                      
                      <TextField
                        label="Quantidade"
                        type="number"
                        value={banknote.quantity}
                        onChange={(e) => handleBanknoteQuantityChange(banknote.value, e.target.value)}
                        inputProps={{ min: 0, max: 999 }}
                        fullWidth
                        size="small"
                      />
                      
                      {banknote.quantity > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Subtotal: R$ {(banknote.value * banknote.quantity).toFixed(2)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <Typography variant="h5" color="primary" textAlign="center">
                Total do Depósito: R$ {totalValue.toFixed(2)}
              </Typography>
            </Paper>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirme os dados do seu depósito:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cédula</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banknotes
                    .filter(banknote => banknote.quantity > 0)
                    .map((banknote) => (
                      <TableRow key={banknote.value}>
                        <TableCell>R$ {banknote.value}</TableCell>
                        <TableCell align="center">{banknote.quantity}</TableCell>
                        <TableCell align="right">
                          R$ {(banknote.value * banknote.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="h6">Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        R$ {totalValue.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info">
              Verifique se todos os dados estão corretos antes de confirmar o depósito.
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <CheckCircleIcon 
              sx={{ fontSize: 64, color: 'success.main', mb: 2 }} 
            />
            <Typography variant="h5" gutterBottom color="success.main">
              Depósito realizado com sucesso!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Valor depositado: R$ {totalValue.toFixed(2)}
            </Typography>
            
            <Box display="flex" gap={2} justifyContent="center">
              <Button 
                variant="outlined" 
                onClick={handleReset}
                size="large"
              >
                Novo Depósito
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/operacoes')}
                size="large"
              >
                Voltar às Operações
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Passo desconhecido';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/operacoes')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Depósito
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Voltar
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? null : (
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 2 ? handleDeposito : handleNext}
                disabled={loading || (!hasSelectedBanknotes && activeStep === 0)}
                sx={{ ml: 1 }}
              >
                {loading ? 'Processando...' : 
                 activeStep === steps.length - 2 ? 'Confirmar Depósito' : 'Próximo'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DepositoPage;
