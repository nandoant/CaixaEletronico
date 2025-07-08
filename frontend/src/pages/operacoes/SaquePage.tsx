import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  TableRow,
  Chip,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  SaqueRequest,
  SaqueOpcao,
  SaqueConfirmacaoRequest,
} from "../../types/operacoes";
import { operacoesService } from "../../services/operacoesService";
import { useAccount } from "../../contexts/AccountContext";

const steps = [
  "Valor do Saque",
  "Escolha da Combinação",
  "Confirmação",
  "Finalização",
];

export const SaquePage: React.FC = () => {
  const navigate = useNavigate();
  const { accountData } = useAccount();
  const [activeStep, setActiveStep] = useState(0);
  const [valor, setValor] = useState<string>("");
  const [opcoesSaque, setOpcoesSaque] = useState<SaqueOpcao[]>([]);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<SaqueOpcao | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operacaoConcluida, setOperacaoConcluida] = useState(false);

  const valorNumerico = parseFloat(valor) || 0;
  const isValorValido = valorNumerico > 0 && valorNumerico % 10 === 0;
  const isSaldoSuficiente = accountData
    ? valorNumerico <= accountData.saldo
    : false;
  const isFormularioValido = isValorValido && isSaldoSuficiente;

  const handleSolicitarOpcoes = async () => {
    if (!isValorValido || !accountData) return;

    // Validação de saldo antes de chamar a API
    if (accountData.saldo < valorNumerico) {
      setError(
        `Saldo insuficiente. Saldo disponível: R$ ${accountData.saldo.toFixed(
          2
        )}`
      );

      // Retorna para a página de operações após 3 segundos
      setTimeout(() => {
        navigate("/operacoes");
      }, 3000);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: SaqueRequest = {
        contaId: accountData.contaId,
        valor: valorNumerico,
      };

      const response = await operacoesService.solicitarOpcoesSaque(request);

      if (!response.dados.saldoSuficiente) {
        setError(response.message);

        // Retorna para a página de operações após 3 segundos
        setTimeout(() => {
          navigate("/operacoes");
        }, 3000);
        return;
      }

      setOpcoesSaque(response.dados.opcoes);
      setActiveStep(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar opções de saque";
      setError(errorMessage);

      // Se for erro de saldo, retorna para operações
      if (
        errorMessage.toLowerCase().includes("saldo") ||
        errorMessage.toLowerCase().includes("insuficiente")
      ) {
        setTimeout(() => {
          navigate("/operacoes");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarOpcao = (opcao: SaqueOpcao) => {
    setOpcaoSelecionada(opcao);
    setActiveStep(2);
  };

  const handleConfirmarSaque = async () => {
    if (!opcaoSelecionada || !accountData) return;

    setLoading(true);
    setError(null);

    try {
      const request: SaqueConfirmacaoRequest = {
        contaId: accountData.contaId,
        valor: valorNumerico,
        idOpcao: opcaoSelecionada.idOpcao,
      };

      await operacoesService.confirmarSaque(request);
      setOperacaoConcluida(true);
      setActiveStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar saque");
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <AccountBalanceWalletIcon
                  sx={{ mr: 2, color: "primary.main" }}
                />
                <Typography variant="h6">Informe o valor do saque</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor do Saque"
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    error={
                      valor !== "" &&
                      (!isValorValido ||
                        (valorNumerico > 0 && !isSaldoSuficiente))
                    }
                    helperText={
                      valor !== "" && !isValorValido
                        ? "O valor deve ser múltiplo de R$ 10,00"
                        : valor !== "" &&
                          valorNumerico > 0 &&
                          !isSaldoSuficiente
                        ? `Saldo insuficiente. Disponível: R$ ${
                            accountData?.saldo.toFixed(2) || "0,00"
                          }`
                        : `Valor mínimo: R$ 10,00 | Saldo disponível: R$ ${
                            accountData?.saldo.toFixed(2) || "0,00"
                          }`
                    }
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 1 }}>R$</Typography>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Typography variant="h6" color="primary">
                      {valorNumerico > 0
                        ? formatarValor(valorNumerico)
                        : "R$ 0,00"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={handleSolicitarOpcoes}
                  disabled={!isFormularioValido || loading || !accountData}
                  size="large"
                >
                  {loading ? "Buscando opções..." : "Buscar Opções de Saque"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <AccountBalanceWalletIcon
                  sx={{ mr: 2, color: "primary.main" }}
                />
                <Typography variant="h6">
                  Escolha a combinação de cédulas para{" "}
                  {formatarValor(valorNumerico)}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {opcoesSaque.map((opcao, index) => (
                  <Grid item xs={12} key={opcao.idOpcao}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: "2px solid transparent",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "primary.50",
                        },
                      }}
                      onClick={() => handleSelecionarOpcao(opcao)}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Opção {index + 1}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {opcao.descricaoLegivel}
                          </Typography>
                          <Chip
                            label={`${opcao.quantidadeTotalDeNotas} nota${
                              opcao.quantidadeTotalDeNotas > 1 ? "s" : ""
                            }`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                        <Button variant="outlined">Escolher</Button>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  startIcon={<ArrowBackIcon />}
                >
                  Voltar
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <CheckCircleIcon sx={{ mr: 2, color: "warning.main" }} />
                <Typography variant="h6">Confirme os dados do saque</Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Valor do Saque</strong>
                      </TableCell>
                      <TableCell>{formatarValor(valorNumerico)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Combinação Escolhida</strong>
                      </TableCell>
                      <TableCell>
                        {opcaoSelecionada?.descricaoLegivel}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Total de Notas</strong>
                      </TableCell>
                      <TableCell>
                        {opcaoSelecionada?.quantidadeTotalDeNotas} nota
                        {opcaoSelecionada?.quantidadeTotalDeNotas !== 1
                          ? "s"
                          : ""}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Atenção:</strong> Após confirmar o saque, a operação
                  não poderá ser cancelada. Certifique-se de que os dados estão
                  corretos.
                </Typography>
              </Alert>

              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(1)}
                  startIcon={<ArrowBackIcon />}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirmarSaque}
                  disabled={loading || !accountData}
                  color="success"
                >
                  {loading ? "Processando..." : "Confirmar Saque"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <CheckCircleIcon
                sx={{ fontSize: 60, color: "success.main", mb: 2 }}
              />
              <Typography variant="h5" gutterBottom color="success.main">
                Saque Realizado com Sucesso!
              </Typography>

              <Divider sx={{ my: 3 }} />

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mt: 3 }}
              >
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Valor Sacado</strong>
                      </TableCell>
                      <TableCell>{formatarValor(valorNumerico)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Combinação</strong>
                      </TableCell>
                      <TableCell>
                        {opcaoSelecionada?.descricaoLegivel}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Data/Hora</strong>
                      </TableCell>
                      <TableCell>
                        {new Date().toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/dashboard")}
                >
                  Voltar ao Dashboard
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setActiveStep(0);
                    setValor("");
                    setOpcoesSaque([]);
                    setOpcaoSelecionada(null);
                    setOperacaoConcluida(false);
                    setError(null);
                  }}
                >
                  Novo Saque
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Validação se os dados da conta estão disponíveis
  if (!accountData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Alert severity="warning">
            Não foi possível carregar os dados da conta. Tente recarregar a
            página.
          </Alert>
          <Button
            onClick={() => navigate("/dashboard")}
            sx={{ mt: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Voltar ao Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/operacoes")}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4">Saque</Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 3 }}
              action={
                error.toLowerCase().includes("saldo") ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/operacoes")}
                    sx={{ ml: 2 }}
                  >
                    Voltar às Operações
                  </Button>
                ) : null
              }
            >
              {error}
              {error.toLowerCase().includes("saldo") && (
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Você será redirecionado automaticamente em alguns segundos...
                </Typography>
              )}
            </Alert>
          )}

          {renderStepContent()}
        </Paper>
      </Box>
    </Container>
  );
};

export default SaquePage;
