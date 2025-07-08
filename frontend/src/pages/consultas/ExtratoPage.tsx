import React, { useState, useEffect } from "react";
import { Box, Typography, Alert } from "@mui/material";
import ExtratoFiltros from "../../components/extrato/ExtratoFiltros";
import ExtratoResumo from "../../components/extrato/ExtratoResumo";
import ExtratoTabelaNova from "../../components/extrato/ExtratoTabelaNova";
import {
  ExtratoFiltros as ExtratoFiltrosType,
  ExtratoNovoResponse,
} from "../../types/operacoes";
import { operacoesService } from "../../services/operacoesService";
import { useConta } from "../../hooks/useConta";

const ExtratoPage: React.FC = () => {
  const { conta, isLoading: contaLoading } = useConta();

  // Estados para filtros
  const [filtros, setFiltros] = useState<ExtratoFiltrosType>({
    limite: 50,
  });

  // Estados para dados
  const [extratoData, setExtratoData] = useState<ExtratoNovoResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Inicializar datas padrão (últimos 30 dias)
  useEffect(() => {
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    setFiltros((prev) => ({
      ...prev,
      dataFim: hoje.toISOString().split("T")[0],
      dataInicio: trintaDiasAtras.toISOString().split("T")[0],
    }));
  }, []);

  const formatarData = (data: Date): string => {
    return data.toISOString().split("T")[0];
  };

  const definirPeriodoPreDefinido = (dias: number) => {
    const hoje = new Date();
    const dataPassada = new Date(hoje);
    dataPassada.setDate(hoje.getDate() - dias);

    setFiltros((prev) => ({
      ...prev,
      dataInicio: formatarData(dataPassada),
      dataFim: formatarData(hoje),
    }));
  };

  const buscarExtrato = async () => {
    console.log("🔍 Iniciando busca do extrato...");
    console.log("📊 Dados da conta:", conta);
    console.log("🔧 Filtros:", filtros);

    if (!conta?.contaId) {
      console.error("❌ ContaId não disponível:", conta);
      setError("Dados da conta não disponíveis.");
      return;
    }

    if (!filtros.dataInicio || !filtros.dataFim) {
      setError("Por favor, selecione as datas de início e fim.");
      return;
    }

    if (new Date(filtros.dataInicio) > new Date(filtros.dataFim)) {
      setError("A data de início deve ser anterior à data de fim.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "📞 Chamando serviço com contaId:",
        conta.contaId,
        "e filtros:",
        filtros
      );
      const response = await operacoesService.obterExtratoNovo(
        conta.contaId,
        filtros
      );
      console.log("✅ Resposta do extrato:", response);
      setExtratoData(response);
    } catch (err) {
      console.error("❌ Erro ao buscar extrato:", err);
      setError("Erro ao carregar extrato. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar extrato automaticamente quando as datas estiverem definidas
  useEffect(() => {
    console.log("🔄 UseEffect do extrato executado:");
    console.log("  - dataInicio:", filtros.dataInicio);
    console.log("  - dataFim:", filtros.dataFim);
    console.log("  - limite:", filtros.limite);
    console.log("  - contaId:", conta?.contaId);

    if (filtros.dataInicio && filtros.dataFim && conta?.contaId) {
      console.log("✅ Condições atendidas, buscando extrato...");
      buscarExtrato();
    } else {
      console.log("⚠️ Condições não atendidas para buscar extrato");
    }
  }, [filtros.dataInicio, filtros.dataFim, filtros.limite, conta?.contaId]);

  // Função de controle de limite
  const handleLimiteChange = (novoLimite: number) => {
    setFiltros((prev) => ({
      ...prev,
      limite: novoLimite,
    }));
  };

  const calcularValorTotalMovimentado = (): number => {
    if (!extratoData?.operacoes) return 0;

    return extratoData.operacoes.reduce((total: number, operacao) => {
      return total + Math.abs(operacao.valor);
    }, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Extrato Bancário
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 3 }}
      >
        Consulte o histórico de movimentações da sua conta
      </Typography>

      {/* Componente de Filtros */}
      <ExtratoFiltros
        dataInicio={filtros.dataInicio || ""}
        dataFim={filtros.dataFim || ""}
        tipoOperacao="TODOS"
        loading={loading}
        onDataInicioChange={(data) =>
          setFiltros((prev) => ({ ...prev, dataInicio: data }))
        }
        onDataFimChange={(data) =>
          setFiltros((prev) => ({ ...prev, dataFim: data }))
        }
        onTipoOperacaoChange={() => {}} // Não usado no novo endpoint
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
          conta={{
            contaId: extratoData.contaId,
            numeroConta: conta?.numeroConta || "",
            titular: extratoData.titular,
            usuarioProprietario: conta?.usuarioProprietario || "",
            usuarioProprietarioId: conta?.usuarioProprietarioId || 0,
            saldo: extratoData.saldoAtual,
          }}
          periodo={{
            dataInicio: filtros.dataInicio || "",
            dataFim: filtros.dataFim || "",
          }}
          totalOperacoes={extratoData.totalOperacoes}
          valorTotalMovimentado={calcularValorTotalMovimentado()}
        />
      )}

      {/* Componente da Tabela */}
      <ExtratoTabelaNova
        operacoes={extratoData?.operacoes || []}
        loading={loading}
        contaId={extratoData?.contaId || conta?.contaId || 1}
        dataInicio={filtros.dataInicio || ""}
        dataFim={filtros.dataFim || ""}
        limite={filtros.limite || 50}
        totalOperacoes={extratoData?.totalOperacoes || 0}
        onLimiteChange={handleLimiteChange}
      />
    </Box>
  );
};

export default ExtratoPage;
