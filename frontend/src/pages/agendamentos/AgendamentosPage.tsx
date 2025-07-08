import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Divider,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Cancel,
  CheckCircle,
  Schedule,
  Payment,
  CalendarToday,
  TrendingUp,
  Add,
  AttachMoney,
  PersonOutline,
  DateRange,
  Refresh,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { operacoesService } from "../../services/operacoesService";
import {
  AgendamentoListItem,
  AgendamentosStats,
  PERIODICIDADE_OPTIONS,
} from "../../types/operacoes";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAccount } from "../../contexts/AccountContext";
import {
  PagamentosAgendadosResponse,
  PagamentoAgendado,
} from "../../services/operacoesService";
import { ContasDisponiveisResponse } from "../../types/operacoes";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const AgendamentosPage: React.FC = () => {
  const navigate = useNavigate();
  const { accountData } = useAccount();
  const [agendamentos, setAgendamentos] = useState<AgendamentoListItem[]>([]);
  const [pagamentosRecebidos, setPagamentosRecebidos] = useState<
    PagamentoAgendado[]
  >([]);
  const [pagamentosEnviados, setPagamentosEnviados] = useState<
    PagamentoAgendado[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] =
    useState<AgendamentoListItem | null>(null);
  const [contasMap, setContasMap] = useState<
    Record<number, { numeroConta: string; titular: string }>
  >({});

  // Buscar pagamentos agendados do backend
  const carregarPagamentosAgendados = async () => {
    if (!accountData?.contaId) {
      setError("Conta do usuário não encontrada.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const dados: PagamentosAgendadosResponse =
        await operacoesService.listarPagamentosAgendados(accountData.contaId);
      setPagamentosRecebidos(dados.pagamentosRecebidos);
      setPagamentosEnviados(dados.pagamentosEnviados);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao buscar pagamentos agendados"
      );
    } finally {
      setLoading(false);
    }
  };

  // Buscar contas disponíveis ao carregar
  useEffect(() => {
    const fetchContas = async () => {
      try {
        const resp: ContasDisponiveisResponse =
          await operacoesService.buscarContasDisponiveis();
        const map: Record<number, { numeroConta: string; titular: string }> =
          {};
        resp.dados.contas.forEach((c) => {
          map[c.contaId] = { numeroConta: c.numeroConta, titular: c.titular };
        });
        setContasMap(map);
      } catch (e) {
        // Não bloqueia a tela se falhar
      }
    };
    fetchContas();
  }, []);

  useEffect(() => {
    carregarPagamentosAgendados();
  }, [accountData?.contaId]);

  // Converte PagamentoAgendado para AgendamentoListItem usando nomes reais
  function converterPagamentoParaAgendamentoListItem(
    p: PagamentoAgendado,
    tipo: "enviado" | "recebido"
  ): AgendamentoListItem {
    let contaId = tipo === "enviado" ? p.contaDestinoId : p.contaOrigemId;
    const conta = contasMap[contaId];
    return {
      id: p.id,
      descricao: p.descricao + (tipo === "recebido" ? " (Recebido)" : ""),
      contaDestino: {
        numeroConta: conta ? conta.numeroConta : String(contaId),
        titular: conta
          ? conta.titular
          : tipo === "enviado"
          ? "Destinatário"
          : "Remetente",
      },
      valorTotal: p.valorTotal,
      valorParcela: p.valorParcela,
      quantidadeParcelas: p.quantidadeParcelas,
      parcelasRestantes: p.parcelasRestantes,
      periodicidadeDias: p.periodicidadeDias,
      dataProximaExecucao: p.dataProximaExecucao,
      dataCriacao: "", // Não vem do backend, pode ser ajustado
      status: p.status,
      primeiraParcelaDebitada: p.parcelasRestantes !== p.quantidadeParcelas,
    };
  }

  // Atualizar agendamentos reais ao receber dados do backend
  useEffect(() => {
    // Junta enviados e recebidos, marcando o tipo
    const ags: AgendamentoListItem[] = [
      ...pagamentosEnviados.map((p) =>
        converterPagamentoParaAgendamentoListItem(p, "enviado")
      ),
      ...pagamentosRecebidos.map((p) =>
        converterPagamentoParaAgendamentoListItem(p, "recebido")
      ),
    ];
    setAgendamentos(ags);
  }, [pagamentosEnviados, pagamentosRecebidos]);

  // Filtrar agendamentos por status
  const agendamentosFiltrados = useMemo(() => {
    switch (selectedTab) {
      case 0:
        return agendamentos; // Todos
      case 1:
        return agendamentos.filter((a) => a.status === "ATIVO");
      case 2:
        return agendamentos.filter((a) => a.status === "CONCLUIDO");
      case 3:
        return agendamentos.filter((a) => a.status === "CANCELADO");
      default:
        return agendamentos;
    }
  }, [agendamentos, selectedTab]);

  // Novo: Filtragem para abas
  const agendamentosEnviados = useMemo(
    () => agendamentos.filter((a) => !a.descricao.includes("(Recebido)")),
    [agendamentos]
  );
  const agendamentosRecebidos = useMemo(
    () => agendamentos.filter((a) => a.descricao.includes("(Recebido)")),
    [agendamentos]
  );

  // Calcular estatísticas
  const stats: AgendamentosStats = useMemo(() => {
    const ativos = agendamentos.filter((a) => a.status === "ATIVO");
    const valorTotalAgendado = ativos.reduce(
      (sum, a) => sum + a.valorParcela * a.parcelasRestantes,
      0
    );

    const proximoPagamento = ativos.sort(
      (a, b) =>
        new Date(a.dataProximaExecucao).getTime() -
        new Date(b.dataProximaExecucao).getTime()
    )[0];

    return {
      totalAtivos: ativos.length,
      valorTotalAgendado,
      proximoPagamento: proximoPagamento
        ? {
            descricao: proximoPagamento.descricao,
            valor: proximoPagamento.valorParcela,
            data: proximoPagamento.dataProximaExecucao,
          }
        : undefined,
    };
  }, [agendamentos]);

  // Abrir dialog de cancelamento
  const abrirCancelamento = (agendamento: AgendamentoListItem) => {
    setAgendamentoParaCancelar(agendamento);
    setCancelDialogOpen(true);
  };

  // Cancelar agendamento
  const cancelarAgendamento = async () => {
    if (!agendamentoParaCancelar) return;

    setCancelando(agendamentoParaCancelar.id);
    setCancelDialogOpen(false);
    setError("");
    setSuccess("");

    try {
      await operacoesService.cancelarAgendamento(agendamentoParaCancelar.id);

      // Atualizar lista local
      setAgendamentos((prev) =>
        prev.map((ag) =>
          ag.id === agendamentoParaCancelar.id
            ? { ...ag, status: "CANCELADO" as const, parcelasRestantes: 0 }
            : ag
        )
      );

      setSuccess(
        `Agendamento "${agendamentoParaCancelar.descricao}" foi cancelado com sucesso`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao cancelar agendamento"
      );
    } finally {
      setCancelando(null);
      setAgendamentoParaCancelar(null);
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
        return "success";
      case "CONCLUIDO":
        return "primary";
      case "CANCELADO":
        return "error";
      default:
        return "default";
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ATIVO":
        return <Schedule />;
      case "CONCLUIDO":
        return <CheckCircle />;
      case "CANCELADO":
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  // Formatar periodicidade
  const formatarPeriodicidade = (dias: number) => {
    const opcao = PERIODICIDADE_OPTIONS.find((p) => p.value === dias);
    return opcao ? opcao.label : `A cada ${dias} dias`;
  };

  if (loading) {
    return <LoadingSpinner message="Carregando agendamentos..." />;
  }

  // Renderização dos cards de agendamento com UX aprimorado
  function AgendamentoCard({
    agendamento,
    tipo,
    onCancelar,
    cancelandoId,
  }: {
    agendamento: AgendamentoListItem;
    tipo: "enviado" | "recebido";
    onCancelar?: (a: AgendamentoListItem) => void;
    cancelandoId?: number | null;
  }) {
    const isRecebido = tipo === "recebido";
    const isConcluido = agendamento.status === "CONCLUIDO";
    const statusColor =
      agendamento.status === "ATIVO"
        ? "success"
        : agendamento.status === "CONCLUIDO"
        ? "primary"
        : "error";
    const statusIcon =
      agendamento.status === "ATIVO" ? (
        <Schedule />
      ) : agendamento.status === "CONCLUIDO" ? (
        <CheckCircle />
      ) : (
        <Cancel />
      );
    return (
      <Card
        sx={{
          height: "100%",
          border: `2px solid`,
          borderColor: statusColor + ".main",
          boxShadow: 3,
          background: isConcluido
            ? "linear-gradient(90deg, #e3f0fa 0%, #f5fafd 100%)"
            : isRecebido
            ? "linear-gradient(90deg, #e3f2fd 0%, #fff 100%)"
            : "linear-gradient(90deg, #fff 0%, #f1f8e9 100%)",
          opacity: agendamento.status === "CANCELADO" ? 0.7 : 1,
          position: "relative",
        }}
      >
        <CardContent>
          {/* Tipo badge */}
          <Box sx={{ position: "absolute", top: 12, right: 12 }}>
            <Chip
              label={isRecebido ? "Recebido" : "Enviado"}
              color={isRecebido ? "info" : "default"}
              size="small"
              icon={isRecebido ? <TrendingUp /> : <Payment />}
              sx={{ fontWeight: 700 }}
            />
          </Box>
          {/* Status */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Chip
              icon={statusIcon}
              label={agendamento.status}
              color={statusColor as any}
              size="small"
              sx={{ fontWeight: 700, mr: 1 }}
            />
          </Box>
          {/* Descrição */}
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              textDecoration:
                agendamento.status === "CANCELADO" ? "line-through" : "none",
            }}
          >
            {agendamento.descricao.replace(" (Recebido)", "")}
          </Typography>
          {/* Conta */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PersonOutline
              sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
            />
            <Typography variant="body2" color="text.secondary">
              {isRecebido ? "De:" : "Para:"} {agendamento.contaDestino.titular}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Valores */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {agendamento.quantidadeParcelas}x de R${" "}
              {agendamento.valorParcela.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: R${" "}
              {agendamento.valorTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>
          {/* Próxima execução e parcelas */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <DateRange sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2">
              Próxima:{" "}
              {new Date(agendamento.dataProximaExecucao).toLocaleDateString(
                "pt-BR"
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {agendamento.parcelasRestantes} restantes
            </Typography>
          </Box>
          {/* Status extra */}
          {agendamento.status === "CONCLUIDO" && (
            <Alert severity="success" sx={{ mb: 1 }}>
              Agendamento concluído
            </Alert>
          )}
          {agendamento.status === "CANCELADO" && (
            <Alert severity="error" sx={{ mb: 1 }}>
              Agendamento cancelado
            </Alert>
          )}
          {/* Botão cancelar (apenas enviados e ativos) */}
          {!isRecebido && agendamento.status === "ATIVO" && onCancelar && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Cancel />}
                onClick={() => onCancelar(agendamento)}
                disabled={cancelandoId === agendamento.id}
              >
                {cancelandoId === agendamento.id ? "Cancelando..." : "Cancelar"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Meus Agendamentos
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Atualizar lista">
            <IconButton
              onClick={carregarPagamentosAgendados}
              disabled={loading}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Schedule color="primary" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="primary">
                  {stats.totalAtivos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agendamentos Ativos
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <AttachMoney color="success" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" color="success.main">
                  R${" "}
                  {stats.valorTotalAgendado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor Total Agendado
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <CalendarToday color="warning" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                {stats.proximoPagamento ? (
                  <>
                    <Typography variant="h6" color="warning.main">
                      {new Date(stats.proximoPagamento.data).toLocaleDateString(
                        "pt-BR"
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Próximo: R${" "}
                      {stats.proximoPagamento.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" color="text.secondary">
                      Nenhum
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Próximo Pagamento
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros por tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`Todos (${agendamentos.length})`} />
          <Tab label={`Enviados (${agendamentosEnviados.length})`} />
          <Tab label={`Recebidos (${agendamentosRecebidos.length})`} />
          <Tab
            label={`Ativos (${
              agendamentos.filter((a) => a.status === "ATIVO").length
            })`}
          />
          <Tab
            label={`Concluídos (${
              agendamentos.filter((a) => a.status === "CONCLUIDO").length
            })`}
          />
          <Tab
            label={`Cancelados (${
              agendamentos.filter((a) => a.status === "CANCELADO").length
            })`}
          />
        </Tabs>
      </Paper>

      {/* Lista de agendamentos */}
      <TabPanel value={selectedTab} index={0}>
        {/* Todos */}
        {agendamentos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Schedule sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedTab === 0
                ? "Você ainda não possui agendamentos. Crie seu primeiro agendamento!"
                : `Não há agendamentos com status ${
                    ["", "ATIVO", "CONCLUÍDO", "CANCELADO"][selectedTab]
                  }.`}
            </Typography>
            {selectedTab === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/operacoes/agendamento")}
              >
                Criar Agendamento
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {agendamentosFiltrados.map((agendamento) => (
              <Grid item xs={12} md={6} lg={4} key={agendamento.id}>
                <AgendamentoCard
                  agendamento={agendamento}
                  tipo={
                    agendamento.descricao.includes("(Recebido)")
                      ? "recebido"
                      : "enviado"
                  }
                  onCancelar={abrirCancelamento}
                  cancelandoId={cancelando}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        {/* Enviados */}
        {agendamentosEnviados.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Schedule sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento enviado encontrado
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {agendamentosEnviados.map((agendamento) => (
              <Grid item xs={12} md={6} lg={4} key={agendamento.id}>
                <AgendamentoCard
                  agendamento={agendamento}
                  tipo="enviado"
                  onCancelar={abrirCancelamento}
                  cancelandoId={cancelando}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        {/* Recebidos */}
        {agendamentosRecebidos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Schedule sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento recebido encontrado
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {agendamentosRecebidos.map((agendamento) => (
              <Grid item xs={12} md={6} lg={4} key={agendamento.id}>
                <AgendamentoCard agendamento={agendamento} tipo="recebido" />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      <TabPanel value={selectedTab} index={3}>
        {/* Ativos */}
        {agendamentos.filter((a) => a.status === "ATIVO").length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Schedule sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento ativo encontrado
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {agendamentos
              .filter((a) => a.status === "ATIVO")
              .map((agendamento) => (
                <Grid item xs={12} md={6} lg={4} key={agendamento.id}>
                  <AgendamentoCard
                    agendamento={agendamento}
                    tipo={
                      agendamento.descricao.includes("(Recebido)")
                        ? "recebido"
                        : "enviado"
                    }
                    onCancelar={abrirCancelamento}
                    cancelandoId={cancelando}
                  />
                </Grid>
              ))}
          </Grid>
        )}
      </TabPanel>
      <TabPanel value={selectedTab} index={4}>
        {/* Concluídos */}
        {agendamentos.filter((a) => a.status === "CONCLUIDO").length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Schedule sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento concluído encontrado
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {agendamentos
              .filter((a) => a.status === "CONCLUIDO")
              .map((agendamento) => (
                <Grid item xs={12} md={6} lg={4} key={agendamento.id}>
                  <AgendamentoCard
                    agendamento={agendamento}
                    tipo={
                      agendamento.descricao.includes("(Recebido)")
                        ? "recebido"
                        : "enviado"
                    }
                  />
                </Grid>
              ))}
          </Grid>
        )}
      </TabPanel>
      <TabPanel value={selectedTab} index={5}>
        {/* Cancelados */}
        {agendamentos.filter((a) => a.status === "CANCELADO").length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Schedule sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento cancelado encontrado
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {agendamentos
              .filter((a) => a.status === "CANCELADO")
              .map((agendamento) => (
                <Grid item xs={12} md={6} lg={4} key={agendamento.id}>
                  <AgendamentoCard
                    agendamento={agendamento}
                    tipo={
                      agendamento.descricao.includes("(Recebido)")
                        ? "recebido"
                        : "enviado"
                    }
                  />
                </Grid>
              ))}
          </Grid>
        )}
      </TabPanel>

      {/* FAB para criar novo agendamento */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => navigate("/operacoes/agendamento")}
      >
        <Add />
      </Fab>

      {/* Dialog de confirmação de cancelamento */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <Cancel color="error" sx={{ mr: 1 }} />
          Cancelar Agendamento
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Tem certeza que deseja cancelar este agendamento?
          </Typography>

          {agendamentoParaCancelar && (
            <Paper sx={{ p: 2, mt: 2, backgroundColor: "grey.50" }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Descrição:</strong> {agendamentoParaCancelar.descricao}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Para:</strong>{" "}
                {agendamentoParaCancelar.contaDestino.titular} (
                {agendamentoParaCancelar.contaDestino.numeroConta})
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Valor:</strong>{" "}
                {agendamentoParaCancelar.quantidadeParcelas}x de R${" "}
                {agendamentoParaCancelar.valorParcela.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
              <Typography variant="body2">
                <strong>Próximo:</strong>{" "}
                {new Date(
                  agendamentoParaCancelar.dataProximaExecucao
                ).toLocaleDateString("pt-BR")}
              </Typography>
            </Paper>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita. As parcelas futuras não serão
            executadas.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
          <Button
            onClick={cancelarAgendamento}
            color="error"
            variant="contained"
            startIcon={<Cancel />}
          >
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgendamentosPage;
