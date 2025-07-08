export interface Banknote {
  value: number;
  quantity: number;
}

export enum TipoCedula {
  DOIS = 'DOIS',
  CINCO = 'CINCO',
  DEZ = 'DEZ',
  VINTE = 'VINTE',
  CINQUENTA = 'CINQUENTA',
  CEM = 'CEM',
  DUZENTOS = 'DUZENTOS'
}

export interface Cedulas {
  [TipoCedula.DOIS]?: number;
  [TipoCedula.CINCO]?: number;
  [TipoCedula.DEZ]?: number;
  [TipoCedula.VINTE]?: number;
  [TipoCedula.CINQUENTA]?: number;
  [TipoCedula.CEM]?: number;
  [TipoCedula.DUZENTOS]?: number;
}

export interface DepositoRequest {
  contaId: number;
  valor: number;
  cedulas: Cedulas;
}

export interface DepositoResponse {
  dados: {
    novoSaldoDisponivel: boolean;
    operacao: {
      tipo: 'DEPOSITO';
      valor: number;
      dataHora: string;
      status: 'CONCLUIDA';
    };
  };
  conta: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number | null;
  };
  message: string;
  timestamp: string;
}

export interface DepositoFormData {
  valor: number;
  cedulas: {
    dois: number;
    cinco: number;
    dez: number;
    vinte: number;
    cinquenta: number;
    cem: number;
    duzentos: number;
  };
}

export const VALORES_CEDULAS = {
  [TipoCedula.DOIS]: 2,
  [TipoCedula.CINCO]: 5,
  [TipoCedula.DEZ]: 10,
  [TipoCedula.VINTE]: 20,
  [TipoCedula.CINQUENTA]: 50,
  [TipoCedula.CEM]: 100,
  [TipoCedula.DUZENTOS]: 200,
} as const;

export interface SaqueRequest {
  contaId: number;
  valor: number;
}

export interface SaqueOpcao {
  idOpcao: string;
  mapaCedulas: { [key: string]: number };
  quantidadeTotalDeNotas: number;
  descricaoLegivel: string;
}

export interface SaqueOpcoesResponse {
  dados: {
    valorSolicitado: number;
    opcoes: SaqueOpcao[];
    totalOpcoes: number;
    saldoSuficiente: boolean;
  };
  conta: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number | null;
  };
  message: string;
  timestamp: string;
}

export interface SaqueConfirmacaoRequest {
  contaId: number;
  valor: number;
  idOpcao: string;
}

export interface SaqueResponse {
  dados: {
    operacao: {
      status: 'CONCLUIDA';
      combinacaoEscolhida: string;
      dataHora: string;
      valor: number;
      tipo: 'SAQUE';
    };
  };
  conta: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number | null;
  };
  message: string;
  timestamp: string;
}

export interface ExtratoRequest {
  id: number;
  dataInicio: string;
  dataFim: string;
  limite: number;
}

export interface ExtratoOperacao {
  id: number;
  tipo: 'SAQUE' | 'DEPOSITO';
  dataHora: string;
  valor: number;
  usuarioResponsavel: string;
  descricao: string;
}

export interface ExtratoResponse {
  dados: {
    periodo: {
      dataFim: string;
      dataInicio: string;
    };
    operacoes: ExtratoOperacao[];
    totalOperacoes: number;
  };
  conta: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number;
  };
  message: string;
  timestamp: string;
}

export interface EnviarExtratoEmailRequest {
  contaId: number;
  dataInicio: string;
  dataFim: string;
  limite: number;
  email?: string;
}

export interface TransferenciaRequest {
  contaOrigemId: number;
  contaDestinoId: number;
  valor: number;
}

export interface TransferenciaResponse {
  contaDestino: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number | null;
  };
  contaOrigem: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number | null;
  };
  dados: {
    operacao: {
      valor: number;
      dataHora: string;
      status: 'CONCLUIDA';
      tipo: 'TRANSFERENCIA';
    };
  };
  message: string;
  timestamp: string;
}

export interface ContasDisponiveisResponse {
  dados: {
    totalContas: number;
    contas: ContaInfo[];
  };
  message: string;
  timestamp: string;
}

export interface AgendamentoRequest {
  contaDestinoId: number;
  valorTotal: number;
  quantidadeParcelas: number;
  periodicidadeDias: number;
  debitarPrimeiraParcela: boolean;
  descricao: string;
  dataInicio: string;
}

export interface AgendamentoResponse {
  contaDestino: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number | null;
  };
  contaOrigem: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number | null;
  };
  dados: {
    valorDebitadoAgora: number;
    agendamento: {
      descricao: string;
      id: number;
      quantidadeParcelas: number;
      valorTotal: number;
      primeiraParcelaDebitada: boolean;
      status: 'CONCLUIDO' | 'ATIVO' | 'CANCELADO';
      valorParcela: number;
      dataProximaExecucao: string;
    };
  };
  message: string;
  timestamp: string;
}

export const PERIODICIDADE_OPTIONS = [
  { value: 7, label: 'Semanal (7 dias)' },
  { value: 15, label: 'Quinzenal (15 dias)' },
  { value: 30, label: 'Mensal (30 dias)' },
  { value: 60, label: 'Bimestral (60 dias)' },
  { value: 90, label: 'Trimestral (90 dias)' }
] as const;

export interface ParcelaCalculada {
  numero: number;
  valor: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'A_PAGAR_HOJE';
}

export interface ContaInfo {
  contaId: number;
  numeroConta: string;
  titular: string;
  usuarioProprietario: string;
  usuarioProprietarioId: number;
}

export interface AgendamentoListItem {
  id: number;
  descricao: string;
  contaDestino: {
    numeroConta: string;
    titular: string;
  };
  valorTotal: number;
  valorParcela: number;
  quantidadeParcelas: number;
  parcelasRestantes: number;
  periodicidadeDias: number;
  dataProximaExecucao: string;
  dataCriacao: string;
  status: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO';
  primeiraParcelaDebitada: boolean;
}

export interface CancelamentoResponse {
  id: number;
  status: 'CANCELADO';
  message: string;
  timestamp: string;
}

export interface AgendamentosStats {
  totalAtivos: number;
  valorTotalAgendado: number;
  proximoPagamento?: {
    descricao: string;
    valor: number;
    data: string;
  };
}

export interface SaldoResponse {
  dados: {
    dataConsulta: string;
  };
  conta: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number;
  };
  message: string;
  timestamp: string;
}

export interface ExtratoFiltros {
  dataInicio?: string;
  dataFim?: string;
  limite?: number;
}

export interface OperacaoExtrato {
  id: number;
  tipo: 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA' | 'PAGAMENTO';
  valor: number;
  dataHora: string;
  descricao: string;
}

export interface ExtratoNovoResponse {
  contaId: number;
  titular: string;
  saldoAtual: number;
  operacoes: OperacaoExtrato[];
  totalOperacoes: number;
}

export interface ExtratoBackendResponse {
  dados: {
    periodo: {
      dataInicio: string;
      dataFim: string;
    };
    operacoes: OperacaoExtrato[];
    totalOperacoes: number;
  };
  conta: {
    contaId: number;
    numeroConta: string;
    titular: string;
    usuarioProprietario: string;
    usuarioProprietarioId: number;
    saldo: number;
  };
  message: string;
  timestamp: string;
}