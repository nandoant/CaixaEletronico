import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { operacoesService } from '../../services/operacoesService';
import { AgendamentoRequest, AgendamentoResponse, ContaInfo, PERIODICIDADE_OPTIONS, ParcelaCalculada } from '../../types/operacoes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarToday, Schedule, Payment } from '@mui/icons-material';

interface FormData {
  numeroContaDestino: string;
  valorTotal: string;
  quantidadeParcelas: number;
  periodicidadeDias: number;
  debitarPrimeiraParcela: boolean;
  descricao: string;
  dataInicio: string;
}

const AgendamentoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    numeroContaDestino: '',
    valorTotal: '',
    quantidadeParcelas: 1,
    periodicidadeDias: 30,
    debitarPrimeiraParcela: true,
    descricao: '',
    dataInicio: new Date().toISOString().split('T')[0]
  });
  const [contaDestino, setContaDestino] = useState<ContaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [buscandoConta, setBuscandoConta] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resultado, setResultado] = useState<AgendamentoResponse | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const steps = ['Conta de Destino', 'Configuração', 'Confirmação'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar conta destino se o número mudou
    if (name === 'numeroContaDestino' && contaDestino) {
      setContaDestino(null);
    }
    
    // Limpar erros
    setError('');
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const buscarContaDestino = async () => {
    if (!formData.numeroContaDestino.trim()) {
      setError('Digite o número da conta de destino');
      return;
    }

    setBuscandoConta(true);
    setError('');

    try {
      const conta = await operacoesService.buscarContaPorNumero(formData.numeroContaDestino);
      
      // Verificar se não é a própria conta
      if (user && conta.usuarioProprietarioId === user.id) {
        setError('Você não pode agendar pagamento para sua própria conta');
        setContaDestino(null);
        return;
      }
      
      setContaDestino(conta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar conta');
      setContaDestino(null);
    } finally {
      setBuscandoConta(false);
    }
  };

  const calcularParcelas = (): ParcelaCalculada[] => {
    const valorTotal = parseFloat(formData.valorTotal) || 0;
    const valorParcela = valorTotal / formData.quantidadeParcelas;
    const dataInicio = new Date(formData.dataInicio);
    const parcelas: ParcelaCalculada[] = [];

    for (let i = 0; i < formData.quantidadeParcelas; i++) {
      const dataVencimento = new Date(dataInicio);
      
      if (i === 0 && formData.debitarPrimeiraParcela) {
        // Primeira parcela é hoje se marcado para debitar
        dataVencimento.setDate(dataInicio.getDate());
      } else {
        // Outras parcelas respeitam a periodicidade
        const diasAdicionar = formData.debitarPrimeiraParcela ? 
          i * formData.periodicidadeDias : 
          (i + 1) * formData.periodicidadeDias;
        dataVencimento.setDate(dataInicio.getDate() + diasAdicionar);
      }

      let status: 'PENDENTE' | 'PAGO' | 'A_PAGAR_HOJE' = 'PENDENTE';
      if (i === 0 && formData.debitarPrimeiraParcela) {
        status = 'A_PAGAR_HOJE';
      }

      parcelas.push({
        numero: i + 1,
        valor: Number(valorParcela.toFixed(2)),
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        status
      });
    }

    return parcelas;
  };

  const validarEtapa = (etapa: number): boolean => {
    switch (etapa) {
      case 0:
        if (!contaDestino) {
          setError('Busque e confirme a conta de destino primeiro');
          return false;
        }
        break;
      case 1:
        const valor = parseFloat(formData.valorTotal);
        if (isNaN(valor) || valor <= 0) {
          setError('Digite um valor válido');
          return false;
        }
        if (formData.quantidadeParcelas < 1 || formData.quantidadeParcelas > 12) {
          setError('Quantidade de parcelas deve ser entre 1 e 12');
          return false;
        }
        if (!formData.descricao.trim()) {
          setError('Digite uma descrição para o agendamento');
          return false;
        }
        if (!formData.dataInicio) {
          setError('Selecione a data de início');
          return false;
        }
        break;
    }
    return true;
  };

  const proximaEtapa = () => {
    if (validarEtapa(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const etapaAnterior = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleConfirmarAgendamento = () => {
    if (validarEtapa(currentStep)) {
      setConfirmDialogOpen(true);
    }
  };

  const criarAgendamento = async () => {
    if (!user || !contaDestino) return;

    setLoading(true);
    setError('');
    setConfirmDialogOpen(false);

    try {
      const request: AgendamentoRequest = {
        contaDestinoId: contaDestino.contaId,
        valorTotal: parseFloat(formData.valorTotal),
        quantidadeParcelas: formData.quantidadeParcelas,
        periodicidadeDias: formData.periodicidadeDias,
        debitarPrimeiraParcela: formData.debitarPrimeiraParcela,
        descricao: formData.descricao,
        dataInicio: formData.dataInicio
      };

      const response = await operacoesService.criarAgendamento(request);
      setResultado(response);
      setSuccess(true);
      
      // Reset form
      setFormData({
        numeroContaDestino: '',
        valorTotal: '',
        quantidadeParcelas: 1,
        periodicidadeDias: 30,
        debitarPrimeiraParcela: true,
        descricao: '',
        dataInicio: new Date().toISOString().split('T')[0]
      });
      setContaDestino(null);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const novoAgendamento = () => {
    setSuccess(false);
    setResultado(null);
    setError('');
  };

  if (loading) {
    return <LoadingSpinner message="Processando agendamento..." />;
  }

  if (success && resultado) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom color="success.main">
              ✓ Agendamento Criado
            </Typography>
            <Chip label={resultado.dados.agendamento.status} color="success" sx={{ mb: 2 }} />
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalhes do Agendamento
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    ID do Agendamento
                  </Typography>
                  <Typography variant="h6">
                    #{resultado.dados.agendamento.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                  <Typography variant="h6">
                    R$ {resultado.dados.agendamento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Parcelas
                  </Typography>
                  <Typography variant="body1">
                    {resultado.dados.agendamento.quantidadeParcelas}x de R$ {resultado.dados.agendamento.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Próxima Execução
                  </Typography>
                  <Typography variant="body1">
                    {new Date(resultado.dados.agendamento.dataProximaExecucao).toLocaleDateString('pt-BR')}
                  </Typography>
                </Grid>
              </Grid>
              
              {resultado.dados.valorDebitadoAgora > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Valor debitado hoje: R$ {resultado.dados.valorDebitadoAgora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="error.main">
                    Conta de Origem
                  </Typography>
                  <Typography variant="body2">
                    <strong>Titular:</strong> {resultado.contaOrigem.titular}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Conta:</strong> {resultado.contaOrigem.numeroConta}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="success.main">
                    Conta de Destino
                  </Typography>
                  <Typography variant="body2">
                    <strong>Titular:</strong> {resultado.contaDestino.titular}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Conta:</strong> {resultado.contaDestino.numeroConta}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={novoAgendamento}
            >
              Novo Agendamento
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/agendamentos')}
            >
              Ver Agendamentos
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/operacoes')}
            >
              Voltar às Operações
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Agendamento de Pagamento
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Agende pagamentos únicos ou parcelados para serem executados automaticamente
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Etapa 1: Conta de Destino */}
        {currentStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              1. Conta de Destino
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', mb: 3 }}>
              <TextField
                name="numeroContaDestino"
                label="Número da Conta"
                value={formData.numeroContaDestino}
                onChange={handleInputChange}
                placeholder="Digite o número da conta"
                fullWidth
                disabled={buscandoConta}
              />
              <Button
                variant="outlined"
                onClick={buscarContaDestino}
                disabled={buscandoConta || !formData.numeroContaDestino.trim()}
                sx={{ minWidth: 120, height: 56 }}
              >
                {buscandoConta ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>

            {contaDestino && (
              <Card sx={{ backgroundColor: 'success.light', color: 'success.contrastText', mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ✓ Conta Encontrada
                  </Typography>
                  <Typography variant="body1">
                    <strong>Titular:</strong> {contaDestino.titular}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Número da Conta:</strong> {contaDestino.numeroConta}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Etapa 2: Configuração */}
        {currentStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              2. Configuração do Pagamento
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="valorTotal"
                  label="Valor Total"
                  type="number"
                  value={formData.valorTotal}
                  onChange={handleInputChange}
                  placeholder="0,00"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0.01,
                    step: 0.01
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="quantidadeParcelas"
                  label="Quantidade de Parcelas"
                  type="number"
                  value={formData.quantidadeParcelas}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{
                    min: 1,
                    max: 12
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Periodicidade</InputLabel>
                  <Select
                    value={formData.periodicidadeDias}
                    label="Periodicidade"
                    onChange={(e) => handleSelectChange('periodicidadeDias', e.target.value)}
                  >
                    {PERIODICIDADE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="dataInicio"
                  label="Data de Início"
                  type="date"
                  value={formData.dataInicio}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="descricao"
                  label="Descrição"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Ex: Pagamento de boleto, Transferência mensal..."
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="debitarPrimeiraParcela"
                      checked={formData.debitarPrimeiraParcela}
                      onChange={handleInputChange}
                    />
                  }
                  label="Debitar primeira parcela imediatamente"
                />
              </Grid>
            </Grid>

            {/* Preview das parcelas */}
            {parseFloat(formData.valorTotal) > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📅 Cronograma de Parcelas
                  </Typography>
                  <List dense>
                    {calcularParcelas().map((parcela) => (
                      <ListItem key={parcela.numero}>
                        <ListItemIcon>
                          {parcela.status === 'A_PAGAR_HOJE' ? (
                            <Payment color="primary" />
                          ) : (
                            <Schedule color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${parcela.numero}ª Parcela - R$ ${parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          secondary={`${new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')} ${parcela.status === 'A_PAGAR_HOJE' ? '(Hoje)' : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Etapa 3: Confirmação */}
        {currentStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              3. Confirmação
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      💳 Resumo do Pagamento
                    </Typography>
                    <Typography variant="body2">
                      <strong>Para:</strong> {contaDestino?.titular}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Conta:</strong> {contaDestino?.numeroConta}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Valor Total:</strong> R$ {parseFloat(formData.valorTotal || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Parcelas:</strong> {formData.quantidadeParcelas}x de R$ {(parseFloat(formData.valorTotal || '0') / formData.quantidadeParcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Descrição:</strong> {formData.descricao}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      📅 Cronograma
                    </Typography>
                    <Typography variant="body2">
                      <strong>Data de Início:</strong> {new Date(formData.dataInicio).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Periodicidade:</strong> {PERIODICIDADE_OPTIONS.find(p => p.value === formData.periodicidadeDias)?.label}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Primeira parcela:</strong> {formData.debitarPrimeiraParcela ? 'Será debitada hoje' : 'Não será debitada hoje'}
                    </Typography>
                    {formData.debitarPrimeiraParcela && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        R$ {(parseFloat(formData.valorTotal || '0') / formData.quantidadeParcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} será debitado imediatamente
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Botões de navegação */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => currentStep === 0 ? navigate('/operacoes') : etapaAnterior()}
          >
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={proximaEtapa}
              disabled={currentStep === 0 && !contaDestino}
            >
              Próximo
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirmarAgendamento}
              disabled={!contaDestino || !formData.valorTotal || !formData.descricao}
            >
              Criar Agendamento
            </Button>
          )}
        </Box>
      </Paper>

      {/* Dialog de confirmação */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="md">
        <DialogTitle>Confirmar Agendamento</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Confirme os dados do agendamento:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Para:</strong> {contaDestino?.titular}
              </Typography>
              <Typography variant="body2">
                <strong>Conta:</strong> {contaDestino?.numeroConta}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Valor Total:</strong> R$ {parseFloat(formData.valorTotal || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2">
                <strong>Parcelas:</strong> {formData.quantidadeParcelas}x
              </Typography>
            </Grid>
          </Grid>
          {formData.debitarPrimeiraParcela && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              A primeira parcela de R$ {(parseFloat(formData.valorTotal || '0') / formData.quantidadeParcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} será debitada imediatamente!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={criarAgendamento} variant="contained">
            Confirmar Agendamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgendamentoPage;
