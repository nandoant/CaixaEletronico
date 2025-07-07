// Tipos para operações bancárias

// Interface para seleção de cédulas na UI
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

// Request para depósito
export interface DepositoRequest {
  contaId: number;
  valor: number;
  cedulas: Cedulas;
}

// Response do depósito
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

// Dados do formulário
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

// Mapeamento de valores das cédulas
export const VALORES_CEDULAS = {
  [TipoCedula.DOIS]: 2,
  [TipoCedula.CINCO]: 5,
  [TipoCedula.DEZ]: 10,
  [TipoCedula.VINTE]: 20,
  [TipoCedula.CINQUENTA]: 50,
  [TipoCedula.CEM]: 100,
  [TipoCedula.DUZENTOS]: 200,
} as const;

// Request para solicitar opções de saque
export interface SaqueRequest {
  contaId: number;
  valor: number;
}

// Opção de combinação de cédulas para saque
export interface SaqueOpcao {
  idOpcao: string;
  mapaCedulas: { [key: string]: number };
  quantidadeTotalDeNotas: number;
  descricaoLegivel: string;
}

// Response das opções de saque
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

// Request para confirmar saque
export interface SaqueConfirmacaoRequest {
  contaId: number;
  valor: number;
  idOpcao: string;
}

// Response da confirmação do saque
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

// Request para obter extrato
export interface ExtratoRequest {
  id: number; // ID do usuário logado
  dataInicio: string; // formato: 2025-06-01
  dataFim: string; // formato: 2025-08-01
  limite: number; // ex: 50
}

// Operação do extrato
export interface ExtratoOperacao {
  id: number;
  tipo: 'SAQUE' | 'DEPOSITO';
  dataHora: string;
  valor: number;
  usuarioResponsavel: string;
  descricao: string;
}

// Response do extrato
export interface ExtratoResponse {
  dados: {
    periodo: {
      dataFim: string; // formato: 2025-08-01T23:59:59
      dataInicio: string; // formato: 2025-06-01T00:00:00
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

// Request para enviar extrato por email
export interface EnviarExtratoEmailRequest {
  contaId: number;
  dataInicio: string;
  dataFim: string;
  limite: number;
  email?: string; // Se não informado, usa o email da conta
}

// Request para transferência
export interface TransferenciaRequest {
  contaOrigemId: number;
  contaDestinoId: number;
  valor: number;
}

// Response da transferência
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

// Request para agendamento de pagamento
export interface AgendamentoRequest {
  contaDestinoId: number;
  valorTotal: number;
  quantidadeParcelas: number;
  periodicidadeDias: number;
  debitarPrimeiraParcela: boolean;
  descricao: string;
  dataInicio: string; // formato YYYY-MM-DD
}

// Response do agendamento
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

// Opções pré-definidas de periodicidade
export const PERIODICIDADE_OPTIONS = [
  { value: 7, label: 'Semanal (7 dias)' },
  { value: 15, label: 'Quinzenal (15 dias)' },
  { value: 30, label: 'Mensal (30 dias)' },
  { value: 60, label: 'Bimestral (60 dias)' },
  { value: 90, label: 'Trimestral (90 dias)' }
] as const;

// Interface para parcela calculada
export interface ParcelaCalculada {
  numero: number;
  valor: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'A_PAGAR_HOJE';
}

// Interface para buscar conta por número
export interface ContaInfo {
  contaId: number;
  numeroConta: string;
  titular: string;
  usuarioProprietario: string;
  usuarioProprietarioId: number;
}

// Interface para agendamento na lista
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

// Response do cancelamento de agendamento
export interface CancelamentoResponse {
  id: number;
  status: 'CANCELADO';
  message: string;
  timestamp: string;
}

// Estatísticas dos agendamentos
export interface AgendamentosStats {
  totalAtivos: number;
  valorTotalAgendado: number;
  proximoPagamento?: {
    descricao: string;
    valor: number;
    data: string;
  };
}

// Consulta de saldo
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