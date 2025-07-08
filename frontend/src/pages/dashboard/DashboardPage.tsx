import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, IconButton, Avatar, List, ListItem, ListItemAvatar, ListItemText, Chip, Tooltip
} from '@mui/material';
import { useConta } from '../../hooks/useConta';
import { operacoesService } from '../../services/operacoesService';
import { Schedule, Refresh, TrendingUp, Payment, CheckCircle, Cancel, AttachMoney } from '@mui/icons-material';
import { AgendamentoListItem, ExtratoOperacao } from '../../types/operacoes';

const DashboardPage: React.FC = () => {
  const { saldoFormatado, isLoading, error, conta } = useConta();
  const [ultimasOperacoes, setUltimasOperacoes] = useState<ExtratoOperacao[]>([]);
  const [loadingOperacoes, setLoadingOperacoes] = useState(true);
  const [erroOperacoes, setErroOperacoes] = useState('');
  const [agendamentos, setAgendamentos] = useState<AgendamentoListItem[]>([]);
  const [loadingAgend, setLoadingAgend] = useState(true);
  const [erroAgend, setErroAgend] = useState('');

  // Buscar últimas operações
  useEffect(() => {
    const fetchOperacoes = async () => {
      if (!conta?.contaId) return;
      setLoadingOperacoes(true);
      setErroOperacoes('');
      try {
        const extrato = await operacoesService.obterExtratoNovo(conta.contaId, { limite: 5 });
        // Corrige o tipo das operações para incluir usuarioResponsavel e filtra tipos aceitos
        setUltimasOperacoes(
          extrato.operacoes
            .filter(op => op.tipo === 'DEPOSITO' || op.tipo === 'SAQUE')
            .map(op => ({
              id: op.id,
              tipo: op.tipo as 'DEPOSITO' | 'SAQUE',
              valor: op.valor,
              dataHora: op.dataHora,
              descricao: op.descricao,
              usuarioResponsavel: conta?.titular || 'Usuário',
            }))
        );
      } catch (e: any) {
        setErroOperacoes(e.message || 'Erro ao buscar operações');
      } finally {
        setLoadingOperacoes(false);
      }
    };
    fetchOperacoes();
  }, [conta?.contaId]);

  // Buscar agendamentos ativos
  useEffect(() => {
    const fetchAgend = async () => {
      if (!conta?.contaId) return;
      setLoadingAgend(true);
      setErroAgend('');
      try {
        const dados = await operacoesService.listarPagamentosAgendados(conta.contaId);
        const ativos = [...dados.pagamentosEnviados, ...dados.pagamentosRecebidos]
          .filter(a => a.status === 'ATIVO')
          .sort((a, b) => new Date(a.dataProximaExecucao).getTime() - new Date(b.dataProximaExecucao).getTime());
        setAgendamentos(ativos.map(a => ({
          id: a.id,
          descricao: a.descricao,
          contaDestino: { numeroConta: '', titular: '' }, // pode ser melhorado
          valorTotal: a.valorTotal,
          valorParcela: a.valorParcela,
          quantidadeParcelas: a.quantidadeParcelas,
          parcelasRestantes: a.parcelasRestantes,
          periodicidadeDias: a.periodicidadeDias,
          dataProximaExecucao: a.dataProximaExecucao,
          dataCriacao: '',
          status: a.status,
          primeiraParcelaDebitada: a.parcelasRestantes !== a.quantidadeParcelas,
        })));
      } catch (e: any) {
        setErroAgend(e.message || 'Erro ao buscar agendamentos');
      } finally {
        setLoadingAgend(false);
      }
    };
    fetchAgend();
  }, [conta?.contaId]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Olá, {conta?.titular || 'usuário'}!
      </Typography>
      <Grid container spacing={3}>
        {/* Saldo */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, boxShadow: 4, borderRadius: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <AttachMoney fontSize="large" />
            </Avatar>
            <Typography variant="h6" color="text.secondary">Saldo Atual</Typography>
            {error ? (
              <Alert severity="error">Erro ao carregar saldo</Alert>
            ) : isLoading ? (
              <CircularProgress size={28} />
            ) : (
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>{saldoFormatado}</Typography>
            )}
            <Tooltip title="Atualizar saldo">
              <IconButton onClick={() => window.location.reload()} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Paper>
        </Grid>
        {/* Últimas operações */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, minHeight: 260, boxShadow: 4, borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Últimas Operações</Typography>
            {erroOperacoes ? (
              <Alert severity="error">{erroOperacoes}</Alert>
            ) : loadingOperacoes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
            ) : ultimasOperacoes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Nenhuma operação recente</Typography>
            ) : (
              <List dense>
                {ultimasOperacoes.map(op => (
                  <ListItem key={op.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: op.tipo === 'DEPOSITO' ? 'success.main' : 'error.main' }}>
                        {op.tipo === 'DEPOSITO' ? <TrendingUp /> : <Payment />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{op.tipo}</Typography>
                        <Typography variant="body2" color="text.secondary">{op.descricao}</Typography>
                      </>}
                      secondary={<>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>{op.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(op.dataHora).toLocaleString('pt-BR')}</Typography>
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        {/* Agendamentos pendentes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, minHeight: 260, boxShadow: 4, borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>Agendamentos Pendentes</Typography>
            {erroAgend ? (
              <Alert severity="error">{erroAgend}</Alert>
            ) : loadingAgend ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
            ) : agendamentos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Nenhum agendamento ativo</Typography>
            ) : (
              <List dense>
                {agendamentos.slice(0, 5).map(ag => (
                  <ListItem key={ag.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main' }}><Schedule /></Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{ag.descricao}</Typography>
                        <Typography variant="body2" color="text.secondary">Próxima: {new Date(ag.dataProximaExecucao).toLocaleDateString('pt-BR')}</Typography>
                      </>}
                      secondary={<>
                        <Chip label={`${ag.parcelasRestantes} restantes`} size="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 700, display: 'inline' }}>{ag.valorParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
