import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import ExtratoFiltros from '../../components/extrato/ExtratoFiltros';
import ExtratoResumo from '../../components/extrato/ExtratoResumo';
import ExtratoTabela from '../../components/extrato/ExtratoTabela';
import { ExtratoRequest, ExtratoResponse } from '../../types/operacoes';
import { operacoesService } from '../../services/operacoesService';

const ExtratoPage: React.FC = () => {
  // Estados para filtros
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [limite, setLimite] = useState<number>(50);
  const [tipoOperacao, setTipoOperacao] = useState<'TODOS' | 'SAQUE' | 'DEPOSITO'>('TODOS');
  
  // Estados para dados
  const [extratoData, setExtratoData] = useState<ExtratoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [extratoCarregado, setExtratoCarregado] = useState<boolean>(false);

  // Inicializar datas padrão (últimos 30 dias)
  useEffect(() => {
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(trintaDiasAtras.toISOString().split('T')[0]);
  }, []);

  const formatarData = (data: Date): string => {
    return data.toISOString().split('T')[0];
  };

  const definirPeriodoPreDefinido = (dias: number) => {
    const hoje = new Date();
    const dataPassada = new Date(hoje);
    dataPassada.setDate(hoje.getDate() - dias);
    
    setDataInicio(formatarData(dataPassada));
    setDataFim(formatarData(hoje));
  };

  const buscarExtrato = async () => {
    if (!dataInicio || !dataFim) {
      setError('Por favor, selecione as datas de início e fim.');
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      setError('A data de início deve ser anterior à data de fim.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const request: ExtratoRequest = {
        id: 2, // ID do usuário logado (mockado)
        dataInicio,
        dataFim,
        limite
      };

      const response = await operacoesService.obterExtrato(request);
      setExtratoData(response);
      setExtratoCarregado(true);
    } catch (err) {
      setError('Erro ao carregar extrato. Tente novamente.');
      console.error('Erro ao buscar extrato:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar extrato automaticamente quando as datas estiverem definidas
  useEffect(() => {
    if (dataInicio && dataFim && !extratoCarregado) {
      buscarExtrato();
    }
  }, [dataInicio, dataFim]);

  const calcularValorTotalMovimentado = (): number => {
    if (!extratoData?.dados.operacoes) return 0;
    
    return extratoData.dados.operacoes.reduce((total, operacao) => {
      return total + operacao.valor;
    }, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Extrato Bancário
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Consulte o histórico de movimentações da sua conta
      </Typography>

      {/* Componente de Filtros */}
      <ExtratoFiltros
        dataInicio={dataInicio}
        dataFim={dataFim}
        limite={limite}
        tipoOperacao={tipoOperacao}
        loading={loading}
        onDataInicioChange={setDataInicio}
        onDataFimChange={setDataFim}
        onLimiteChange={setLimite}
        onTipoOperacaoChange={setTipoOperacao}
        onBuscar={buscarExtrato}
        onPeriodoPreDefinido={definirPeriodoPreDefinido}
      />

      {/* Exibição de Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Componente de Resumo */}
      {extratoData && !loading && (
        <ExtratoResumo
          conta={extratoData.conta}
          periodo={extratoData.dados.periodo}
          totalOperacoes={extratoData.dados.totalOperacoes}
          valorTotalMovimentado={calcularValorTotalMovimentado()}
        />
      )}

      {/* Componente da Tabela */}
      <ExtratoTabela
        operacoes={extratoData?.dados.operacoes || []}
        loading={loading}
        tipoFiltro={tipoOperacao}
        contaId={extratoData?.conta.contaId || 1}
        dataInicio={dataInicio}
        dataFim={dataFim}
        limite={limite}
      />
    </Box>
  );
};

export default ExtratoPage;
