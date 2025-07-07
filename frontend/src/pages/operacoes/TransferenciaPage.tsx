import React, { useState } from "react";
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
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { operacoesService } from "../../services/operacoesService";
import {
  TransferenciaRequest,
  TransferenciaResponse,
  ContaInfo,
} from "../../types/operacoes";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface FormData {
  numeroContaDestino: string;
  valor: string;
}

const TransferenciaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    numeroContaDestino: "",
    valor: "",
  });
  const [contaDestino, setContaDestino] = useState<ContaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [buscandoConta, setBuscandoConta] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resultado, setResultado] = useState<TransferenciaResponse | null>(
    null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar conta destino se o número mudou
    if (name === "numeroContaDestino" && contaDestino) {
      setContaDestino(null);
    }

    // Limpar erros e success
    setError("");
    setSuccess(false);
  };

  const buscarContaDestino = async () => {
    if (!formData.numeroContaDestino.trim()) {
      setError("Digite o número da conta de destino");
      return;
    }

    setBuscandoConta(true);
    setError("");

    try {
      const conta = await operacoesService.buscarContaPorNumero(
        formData.numeroContaDestino
      );

      // Verificar se não é a própria conta
      if (user && conta.usuarioProprietarioId === user.id) {
        setError("Você não pode transferir para sua própria conta");
        setContaDestino(null);
        return;
      }

      setContaDestino(conta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar conta");
      setContaDestino(null);
    } finally {
      setBuscandoConta(false);
    }
  };

  const validarFormulario = (): boolean => {
    if (!contaDestino) {
      setError("Busque e confirme a conta de destino primeiro");
      return false;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      setError("Digite um valor válido para transferência");
      return false;
    }

    if (valor < 0.01) {
      setError("O valor mínimo para transferência é R$ 0,01");
      return false;
    }

    return true;
  };

  const handleConfirmarTransferencia = () => {
    if (!validarFormulario()) return;
    setConfirmDialogOpen(true);
  };

  const realizarTransferencia = async () => {
    if (!user || !contaDestino) return;

    setLoading(true);
    setError("");
    setConfirmDialogOpen(false);

    try {
      const request: TransferenciaRequest = {
        contaOrigemId: user.contaId, // Usar o contaId em vez do id do usuário
        contaDestinoId: contaDestino.contaId,
        valor: parseFloat(formData.valor),
      };

      const response = await operacoesService.realizarTransferencia(request);
      setResultado(response);
      setSuccess(true);

      // Limpar formulário após sucesso
      setFormData({ numeroContaDestino: "", valor: "" });
      setContaDestino(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao realizar transferência"
      );
    } finally {
      setLoading(false);
    }
  };

  const novaTransferencia = () => {
    setSuccess(false);
    setResultado(null);
    setError("");
  };

  if (loading) {
    return <LoadingSpinner message="Processando transferência..." />;
  }

  if (success && resultado) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" gutterBottom color="success.main">
              ✓ Transferência Realizada
            </Typography>
            <Chip label="CONCLUÍDA" color="success" sx={{ mb: 2 }} />
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalhes da Transferência
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Transferido
                  </Typography>
                  <Typography variant="h6">
                    R${" "}
                    {resultado.dados.operacao.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data/Hora
                  </Typography>
                  <Typography variant="body1">
                    {new Date(resultado.dados.operacao.dataHora).toLocaleString(
                      "pt-BR"
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    color="error.main"
                  >
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
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    color="success.main"
                  >
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

          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button variant="contained" onClick={novaTransferencia}>
              Nova Transferência
            </Button>
            <Button variant="outlined" onClick={() => navigate("/operacoes")}>
              Voltar às Operações
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Transferência
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Transfira dinheiro para outra conta de forma rápida e segura
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {/* Busca da conta de destino */}
          <Box>
            <Typography variant="h6" gutterBottom>
              1. Conta de Destino
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "start" }}>
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
                {buscandoConta ? "Buscando..." : "Buscar"}
              </Button>
            </Box>
          </Box>

          {/* Informações da conta encontrada */}
          {contaDestino && (
            <Card
              sx={{
                backgroundColor: "success.light",
                color: "success.contrastText",
              }}
            >
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

          <Divider />

          {/* Valor da transferência */}
          <Box>
            <Typography variant="h6" gutterBottom>
              2. Valor da Transferência
            </Typography>
            <TextField
              name="valor"
              label="Valor"
              type="number"
              value={formData.valor}
              onChange={handleInputChange}
              placeholder="0,00"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
              inputProps={{
                min: 0.01,
                step: 0.01,
              }}
              disabled={!contaDestino}
            />
          </Box>

          {/* Botões de ação */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/operacoes")}
              sx={{ minWidth: 120 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmarTransferencia}
              disabled={
                !contaDestino ||
                !formData.valor ||
                parseFloat(formData.valor) <= 0
              }
              sx={{ minWidth: 120 }}
            >
              Transferir
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Dialog de confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Transferência</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Confirme os dados da transferência:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Para:</strong> {contaDestino?.titular} (Conta:{" "}
              {contaDestino?.numeroConta})
            </Typography>
            <Typography variant="body2">
              <strong>Valor:</strong> R${" "}
              {parseFloat(formData.valor || "0").toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={realizarTransferencia} variant="contained">
            Confirmar Transferência
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransferenciaPage;
