import React, { useState } from "react";
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
  Snackbar,
} from "@mui/material";
import {
  TrendingUp as DepositoIcon,
  TrendingDown as SaqueIcon,
  SwapHoriz as TransferenciaIcon,
  Payment as PagamentoIcon,
  Email as EmailIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { OperacaoExtrato } from "../../types/operacoes";

interface ExtratoTabelaNovaProps {
  operacoes: OperacaoExtrato[];
  loading: boolean;
  contaId: number;
  dataInicio: string;
  dataFim: string;
  limite: number;
  totalOperacoes: number;
  onLimiteChange: (novoLimite: number) => void;
}

const ExtratoTabelaNova: React.FC<ExtratoTabelaNovaProps> = ({
  operacoes,
  loading,
  contaId,
  dataInicio,
  dataFim,
  limite,
  totalOperacoes,
  onLimiteChange,
}) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Função para formatar data e hora
  const formatarDataHora = (dataHora: string): string => {
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para formatar valor monetário
  const formatarValor = (valor: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Função para obter ícone por tipo de operação
  const obterIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case "DEPOSITO":
        return <DepositoIcon sx={{ color: "success.main" }} />;
      case "SAQUE":
        return <SaqueIcon sx={{ color: "error.main" }} />;
      case "TRANSFERENCIA":
        return <TransferenciaIcon sx={{ color: "warning.main" }} />;
      case "PAGAMENTO":
        return <PagamentoIcon sx={{ color: "info.main" }} />;
      default:
        return <InfoIcon sx={{ color: "grey.500" }} />;
    }
  };

  // Função para obter cor por tipo de operação
  const obterCorPorTipo = (tipo: string) => {
    switch (tipo) {
      case "DEPOSITO":
        return "success";
      case "SAQUE":
        return "error";
      case "TRANSFERENCIA":
        return "warning";
      case "PAGAMENTO":
        return "info";
      default:
        return "default";
    }
  };

  // Função para determinar se o valor é positivo ou negativo
  const obterCorValor = (tipo: string, valor: number) => {
    if (tipo === "DEPOSITO") {
      return "success.main";
    } else {
      return "error.main";
    }
  };

  // Função para enviar extrato por email
  const handleEnviarEmail = async () => {
    if (!email) {
      setSnackbarMessage("Por favor, informe um email válido.");
      setSnackbarOpen(true);
      return;
    }

    try {
      setEmailLoading(true);
      // Aqui você pode implementar a chamada para enviar o extrato por email
      // usando o novo endpoint se disponível

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulação

      setSnackbarMessage("Extrato enviado por email com sucesso!");
      setSnackbarOpen(true);
      setEmailDialogOpen(false);
      setEmail("");
    } catch (error) {
      setSnackbarMessage("Erro ao enviar extrato por email.");
      setSnackbarOpen(true);
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Carregando operações...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!operacoes || operacoes.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhuma operação encontrada para o período selecionado.
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ mt: 2 }}>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Operações ({operacoes.length})</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EmailIcon />}
            onClick={() => setEmailDialogOpen(true)}
          >
            Enviar por Email
          </Button>
        </Box>

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
              {operacoes.map((operacao) => (
                <TableRow key={operacao.id} hover>
                  <TableCell>{formatarDataHora(operacao.dataHora)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {obterIconePorTipo(operacao.tipo)}
                      <Chip
                        label={operacao.tipo}
                        size="small"
                        color={obterCorPorTipo(operacao.tipo) as any}
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {operacao.descricao}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      color={obterCorValor(operacao.tipo, operacao.valor)}
                    >
                      {formatarValor(operacao.valor)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Controle de limite de operações */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Total de operações: {totalOperacoes}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">Mostrar:</Typography>
            <select
              value={limite}
              onChange={(e) => onLimiteChange(Number(e.target.value))}
              style={{
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
            <Typography variant="body2">operações</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Dialog para envio por email */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <DialogTitle>Enviar Extrato por Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            O extrato será enviado para o email informado com as operações do
            período selecionado.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={emailLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEmailDialogOpen(false)}
            disabled={emailLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnviarEmail}
            disabled={emailLoading}
            variant="contained"
          >
            {emailLoading ? <CircularProgress size={20} /> : "Enviar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default ExtratoTabelaNova;
