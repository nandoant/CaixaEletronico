import React from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

interface ExtratoFiltrosProps {
  dataInicio: string;
  dataFim: string;
  tipoOperacao: "TODOS" | "SAQUE" | "DEPOSITO";
  loading: boolean;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
  onTipoOperacaoChange: (tipo: "TODOS" | "SAQUE" | "DEPOSITO") => void;
  onBuscar: () => void;
  onPeriodoPreDefinido: (dias: number) => void;
}

const ExtratoFiltros: React.FC<ExtratoFiltrosProps> = ({
  dataInicio,
  dataFim,
  tipoOperacao,
  loading,
  onDataInicioChange,
  onDataFimChange,
  onTipoOperacaoChange,
  onBuscar,
  onPeriodoPreDefinido,
}) => {
  const formatarData = (data: Date): string => {
    return data.toISOString().split("T")[0];
  };

  const hoje = formatarData(new Date());

  const periodosPredefinidos = [
    { label: "Últimos 7 dias", dias: 7 },
    { label: "Últimos 30 dias", dias: 30 },
    { label: "Últimos 90 dias", dias: 90 },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <FilterIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6">Filtros do Extrato</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Períodos Pré-definidos */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Períodos rápidos:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {periodosPredefinidos.map((periodo) => (
              <Chip
                key={periodo.dias}
                label={periodo.label}
                onClick={() => onPeriodoPreDefinido(periodo.dias)}
                variant="outlined"
                clickable
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Grid>

        {/* Data Início */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Data Início"
            type="date"
            value={dataInicio}
            onChange={(e) => onDataInicioChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: hoje }}
          />
        </Grid>

        {/* Data Fim */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Data Fim"
            type="date"
            value={dataFim}
            onChange={(e) => onDataFimChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              max: hoje,
              min: dataInicio,
            }}
          />
        </Grid>

        {/* Tipo de Operação */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipoOperacao}
              label="Tipo"
              onChange={(e) =>
                onTipoOperacaoChange(
                  e.target.value as "TODOS" | "SAQUE" | "DEPOSITO"
                )
              }
            >
              <MenuItem value="TODOS">Todas</MenuItem>
              <MenuItem value="DEPOSITO">Depósitos</MenuItem>
              <MenuItem value="SAQUE">Saques</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Botão Buscar */}
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={onBuscar}
            disabled={loading || !dataInicio || !dataFim}
            startIcon={<SearchIcon />}
            sx={{ height: "56px" }}
          >
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExtratoFiltros;
