import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import {
  TrendingUp as DepositoIcon,
  TrendingDown as SaqueIcon,
  Email as EmailIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ExtratoOperacao, EnviarExtratoEmailRequest } from '../../types/operacoes';
import { operacoesService } from '../../services/operacoesService';

interface ExtratoTabelaProps {
  operacoes: ExtratoOperacao[];
  loading: boolean;
  tipoFiltro: 'TODOS' | 'SAQUE' | 'DEPOSITO';
  contaId: number;
  dataInicio: string;
  dataFim: string;
  limite: number;
}

const ExtratoTabela: React.FC<ExtratoTabelaProps> = ({
  operacoes,
  loading,
  tipoFiltro,
  contaId,
  dataInicio,
  dataFim,
  limite
}) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailCustom, setEmailCustom] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarDataHora = (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const obterCorOperacao = (tipo: 'SAQUE' | 'DEPOSITO'): 'success' | 'error' => {
    return tipo === 'DEPOSITO' ? 'success' : 'error';
  };

  const obterIconeOperacao = (tipo: 'SAQUE' | 'DEPOSITO') => {
    return tipo === 'DEPOSITO' ? 
      <DepositoIcon fontSize="small" /> : 
      <SaqueIcon fontSize="small" />;
  };

  const filtrarOperacoes = () => {
    if (tipoFiltro === 'TODOS') return operacoes;
    return operacoes.filter(op => op.tipo === tipoFiltro);
  };

  const handleEnviarEmail = async () => {
    try {
      setEnviandoEmail(true);
      
      const request: EnviarExtratoEmailRequest = {
        contaId,
        dataInicio,
        dataFim,
        limite,
        email: emailCustom || undefined
      };

      await operacoesService.enviarExtratoPorEmail(request);
      
      setSnackbar({ 
        open: true, 
        message: 'Extrato enviado por email com sucesso!', 
        severity: 'success' 
      });
      setEmailDialogOpen(false);
      setEmailCustom('');
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Erro ao enviar extrato por email. Tente novamente.', 
        severity: 'error' 
      });
    } finally {
      setEnviandoEmail(false);
    }
  };

  const operacoesFiltradas = filtrarOperacoes();

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">
          Carregando extrato...
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ mb: 3 }}>
        {/* Cabeçalho com título e botão de email */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Histórico de Operações
            {operacoesFiltradas.length > 0 && (
              <Chip 
                size="small" 
                label={`${operacoesFiltradas.length} ${operacoesFiltradas.length === 1 ? 'operação' : 'operações'}`}
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          
          {operacoesFiltradas.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={() => setEmailDialogOpen(true)}
              disabled={enviandoEmail}
            >
              Enviar por Email
            </Button>
          )}
        </Box>

        {operacoesFiltradas.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma operação encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tipoFiltro === 'TODOS' 
                ? 'Não há operações no período selecionado.'
                : `Não há operações do tipo "${tipoFiltro}" no período selecionado.`
              }
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operacoesFiltradas.map((operacao) => (
                  <TableRow key={operacao.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatarDataHora(operacao.dataHora)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={obterIconeOperacao(operacao.tipo)}
                        label={operacao.tipo}
                        color={obterCorOperacao(operacao.tipo)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {operacao.descricao}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {operacao.id}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body1" 
                        fontWeight="medium"
                        color={operacao.tipo === 'DEPOSITO' ? 'success.main' : 'error.main'}
                      >
                        {operacao.tipo === 'DEPOSITO' ? '+' : '-'} {formatarMoeda(operacao.valor)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog para envio de email */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Enviar Extrato por Email
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            O extrato será enviado para o email cadastrado na conta. Você pode especificar um email diferente abaixo se desejar.
          </Alert>
          <TextField
            fullWidth
            label="Email (opcional)"
            type="email"
            value={emailCustom}
            onChange={(e) => setEmailCustom(e.target.value)}
            placeholder="email@exemplo.com"
            helperText="Deixe em branco para usar o email da conta"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)} disabled={enviandoEmail}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEnviarEmail} 
            variant="contained" 
            disabled={enviandoEmail}
            startIcon={enviandoEmail ? <CircularProgress size={16} /> : <EmailIcon />}
          >
            {enviandoEmail ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExtratoTabela;
