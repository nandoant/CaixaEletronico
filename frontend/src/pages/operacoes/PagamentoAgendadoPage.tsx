import React, { useState, useEffect } from 'react';
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
  ListItemIcon,
  Divider,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { operacoesService } from '../../services/operacoesService';
import { 
  AgendamentoRequest, 
  AgendamentoResponse, 
  ContaInfo, 
  PERIODICIDADE_OPTIONS 
} from '../../types/operacoes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  CalendarToday, 
  Schedule, 
  Payment, 
  AccountBalance,
  CheckCircle,
  ArrowBack,
  Search,
  Person,
  CreditCard,
  TrendingUp
} from '@mui/icons-material';

interface FormData {
  numeroContaDestino: string;
  valorTotal: string;
  quantidadeParcelas: number;
  periodicidadeDias: number;
  debitarPrimeiraParcela: boolean;
  descricao: string;
  dataInicio: string;
}

const PagamentoAgendadoPage: React.FC = () => {
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

  const steps = ['Conta de Destino', 'Configuração do Pagamento', 'Confirmação'];

  // Calcular valor da parcela
  const valorParcela = formData.valorTotal ? 
    (parseFloat(formData.valorTotal) / formData.quantidadeParcelas) : 0;

  // Calcular valor a ser debitado imediatamente
  const valorImediato = formData.debitarPrimeiraParcela ? valorParcela : 0;

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

  const validarPasso = (passo: number): boolean => {
    switch (passo) {
      case 0: // Conta de destino
        if (!contaDestino) {
          setError('Busque e confirme a conta de destino primeiro');
          return false;
        }
        return true;

      case 1: // Configuração
        const valor = parseFloat(formData.valorTotal);
        if (isNaN(valor) || valor <= 0) {
          setError('Digite um valor válido para o pagamento');
          return false;
        }
        if (valor < 0.01) {
          setError('O valor mínimo para pagamento é R$ 0,01');
          return false;
        }
        if (formData.quantidadeParcelas < 1) {
          setError('A quantidade de parcelas deve ser no mínimo 1');
          return false;
        }
        if (!formData.descricao.trim()) {
          setError('Digite uma descrição para o pagamento');
          return false;
        }
        const dataInicio = new Date(formData.dataInicio);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataInicio < hoje) {
          setError('A data de início não pode ser anterior ao dia atual');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const proximoPasso = () => {
    if (validarPasso(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const passoAnterior = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError('');
  };

  const handleConfirmarPagamento = () => {
    if (!validarPasso(2)) return;
    setConfirmDialogOpen(true);
  };

  const criarPagamentoAgendado = async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pagamento agendado');
    } finally {
      setLoading(false);
    }
  };

  const novoPagamento = () => {
    setSuccess(false);
    setResultado(null);
    setError('');
    setCurrentStep(0);
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
  };

  // Gerar preview das próximas datas de pagamento
  const gerarPreviewDatas = () => {
    if (!formData.dataInicio || formData.quantidadeParcelas < 1) return [];
    
    const datas = [];
    const dataBase = new Date(formData.dataInicio);
    
    for (let i = 0; i < Math.min(formData.quantidadeParcelas, 5); i++) {
      const data = new Date(dataBase);
      data.setDate(data.getDate() + (i * formData.periodicidadeDias));
      datas.push(data);
    }
    
    return datas;
  };

  if (loading) {
    return <LoadingSpinner message="Criando pagamento agendado..." />;
  }

  if (success && resultado) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Pagamento Agendado com Sucesso!
            </Typography>
            <Chip 
              label={resultado.dados.agendamento.status} 
              color={resultado.dados.agendamento.status === 'ATIVO' ? 'primary' : 'success'} 
              sx={{ mb: 2 }} 
            />
          </Box>

          <Grid container spacing={3}>
            {/* Informações das Contas */}
            <Grid item xs={12}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Informações das Contas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Conta Origem</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {resultado.contaOrigem.titular}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {resultado.contaOrigem.numeroConta}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Conta Destino</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {resultado.contaDestino.titular}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {resultado.contaDestino.numeroConta}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Detalhes do Agendamento */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Detalhes do Agendamento
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="ID do Agendamento" 
                        secondary={`#${resultado.dados.agendamento.id}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Descrição" 
                        secondary={resultado.dados.agendamento.descricao} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Status" 
                        secondary={resultado.dados.agendamento.status} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Próxima Execução" 
                        secondary={new Date(resultado.dados.agendamento.dataProximaExecucao).toLocaleDateString('pt-BR')} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Valores */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Valores
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Valor Total" 
                        secondary={`R$ ${resultado.dados.agendamento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Valor da Parcela" 
                        secondary={`R$ ${resultado.dados.agendamento.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Quantidade de Parcelas" 
                        secondary={resultado.dados.agendamento.quantidadeParcelas} 
                      />
                    </ListItem>
                    {resultado.dados.valorDebitadoAgora > 0 && (
                      <ListItem>
                        <ListItemText 
                          primary="Valor Debitado Hoje" 
                          secondary={`R$ ${resultado.dados.valorDebitadoAgora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="success" sx={{ mt: 3 }}>
            {resultado.message}
          </Alert>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={novoPagamento}
              startIcon={<Payment />}
            >
              Novo Pagamento
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/agendamentos')}
              startIcon={<Schedule />}
            >
              Ver Agendamentos
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              startIcon={<ArrowBack />}
            >
              Voltar ao Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            <Payment sx={{ mr: 2, verticalAlign: 'middle' }} />
            Agendamento de Pagamento
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure um pagamento automático com parcelas programadas
          </Typography>
        </Box>

        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Passo 1: Conta de Destino */}
        {currentStep === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
                Conta de Destino
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Número da Conta de Destino"
                    name="numeroContaDestino"
                    value={formData.numeroContaDestino}
                    onChange={handleInputChange}
                    placeholder="Ex: 2025000002"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCard />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={buscarContaDestino}
                    disabled={buscandoConta || !formData.numeroContaDestino.trim()}
                    startIcon={buscandoConta ? <></> : <Search />}
                    sx={{ height: '56px' }}
                  >
                    {buscandoConta ? 'Buscando...' : 'Buscar Conta'}
                  </Button>
                </Grid>
              </Grid>

              {buscandoConta && (
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="rectangular" height={100} />
                </Box>
              )}

              {contaDestino && (
                <Card sx={{ mt: 3, bgcolor: 'success.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6" color="success.main">
                        Conta Encontrada
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Titular
                        </Typography>
                        <Typography variant="h6">
                          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {contaDestino.titular}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Número da Conta
                        </Typography>
                        <Typography variant="h6">
                          <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {contaDestino.numeroConta}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Passo 2: Configuração do Pagamento */}
        {currentStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuração do Pagamento
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor Total"
                    name="valorTotal"
                    type="number"
                    value={formData.valorTotal}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    inputProps={{ min: 0.01, step: 0.01 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quantidade de Parcelas"
                    name="quantidadeParcelas"
                    type="number"
                    value={formData.quantidadeParcelas}
                    onChange={handleInputChange}
                    inputProps={{ min: 1 }}
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
                    fullWidth
                    label="Data de Início"
                    name="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição do Pagamento"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Ex: Aluguel, Financiamento, Empréstimo..."
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.debitarPrimeiraParcela}
                        onChange={handleInputChange}
                        name="debitarPrimeiraParcela"
                      />
                    }
                    label="Debitar primeira parcela hoje"
                  />
                </Grid>
              </Grid>

              {/* Preview dos Cálculos */}
              {formData.valorTotal && (
                <Card sx={{ mt: 3, bgcolor: 'info.50' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Resumo dos Valores
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Valor da Parcela
                        </Typography>
                        <Typography variant="h6">
                          R$ {valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Valor Imediato
                        </Typography>
                        <Typography variant="h6" color={valorImediato > 0 ? 'warning.main' : 'text.primary'}>
                          R$ {valorImediato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Preview das Datas */}
              {formData.dataInicio && formData.quantidadeParcelas > 1 && (
                <Card sx={{ mt: 2, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Próximas Datas de Pagamento
                    </Typography>
                    <Grid container spacing={1}>
                      {gerarPreviewDatas().map((data, index) => (
                        <Grid item xs={6} md={4} key={index}>
                          <Chip
                            label={`${index + 1}ª: ${data.toLocaleDateString('pt-BR')}`}
                            variant="outlined"
                            size="small"
                            color={index === 0 && formData.debitarPrimeiraParcela ? 'warning' : 'default'}
                          />
                        </Grid>
                      ))}
                      {formData.quantidadeParcelas > 5 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            ... e mais {formData.quantidadeParcelas - 5} parcelas
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Passo 3: Confirmação */}
        {currentStep === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Confirmação dos Dados
              </Typography>
              
              <Grid container spacing={3}>
                {/* Conta de Destino */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Conta de Destino
                      </Typography>
                      <Typography variant="body1">
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                        {contaDestino?.titular}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Conta: {contaDestino?.numeroConta}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Detalhes do Pagamento */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Detalhes do Pagamento
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Valor Total" 
                            secondary={`R$ ${parseFloat(formData.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Parcelas" 
                            secondary={`${formData.quantidadeParcelas}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Periodicidade" 
                            secondary={PERIODICIDADE_OPTIONS.find(p => p.value === formData.periodicidadeDias)?.label} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Data de Início" 
                            secondary={new Date(formData.dataInicio).toLocaleDateString('pt-BR')} 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Resumo Financeiro */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Resumo Financeiro
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Descrição" 
                            secondary={formData.descricao} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Primeira Parcela" 
                            secondary={formData.debitarPrimeiraParcela ? 'Debitar hoje' : 'Debitar na data de início'} 
                          />
                        </ListItem>
                        {valorImediato > 0 && (
                          <ListItem>
                            <ListItemText 
                              primary="Valor a Debitar Hoje" 
                              secondary={`R$ ${valorImediato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {valorImediato > 0 && (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  <strong>Atenção:</strong> O valor de R$ {valorImediato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                  será debitado imediatamente da sua conta após a confirmação.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botões de Navegação */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/operacoes')}
            startIcon={<ArrowBack />}
          >
            Cancelar
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {currentStep > 0 && (
              <Button
                variant="outlined"
                onClick={passoAnterior}
              >
                Voltar
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={proximoPasso}
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleConfirmarPagamento}
                color="primary"
              >
                Confirmar Agendamento
              </Button>
            )}
          </Box>
        </Box>

        {/* Dialog de Confirmação */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>
            Confirmar Agendamento de Pagamento
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Deseja confirmar o agendamento do pagamento com os seguintes dados?
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Destinatário:</strong> {contaDestino?.titular}
              </Typography>
              <Typography variant="body2">
                <strong>Valor Total:</strong> R$ {parseFloat(formData.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2">
                <strong>Parcelas:</strong> {formData.quantidadeParcelas}x de R$ {valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              {valorImediato > 0 && (
                <Typography variant="body2" color="warning.main">
                  <strong>Será debitado hoje:</strong> R$ {valorImediato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={criarPagamentoAgendado} 
              variant="contained"
              color="primary"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default PagamentoAgendadoPage;
