// Tipos principais do sistema
export interface Usuario {
  id: number;
  login: string;
  email: string;
  perfil: 'ADMIN' | 'CLIENTE';
}

export interface Conta {
  id: number;
  titular: string;
  saldo: number;
  proprietario: string;
  usuario?: Usuario;
}

export interface Operacao {
  id: number;
  tipo: 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA' | 'PAGAMENTO_PARCELA' | 'DESFAZER';
  valor: number;
  dataHora: string;
  conta: Conta;
  contaDestino?: Conta;
  descricao?: string;
}

export interface CombinacaoCedulas {
  id: string;
  combinacao: Record<string, number>;
  valorTotal: number;
}

export interface PagamentoAgendado {
  id: number;
  valorTotal: number;
  valorParcela: number;
  quantidadeParcelas: number;
  periodicidadeDias: number;
  dataInicio: string;
  proximaExecucao?: string;
  parcelasExecutadas: number;
  status: 'ATIVO' | 'PAUSADO' | 'CANCELADO' | 'CONCLUIDO';
  conta: Conta;
}

export interface EstoqueGlobal {
  valorCedula: {
    valor: number;
    nome: string;
  };
  quantidade: number;
}

// Tipos para formulários
export interface LoginForm {
  login: string;
  senha: string;
}

export interface RegisterForm {
  login: string;
  email: string;
  senha: string;
  confirmaSenha: string;
}

export interface DepositoForm {
  contaId: number;
  valor: number;
  cedulas: Record<string, number>;
}

export interface SaqueForm {
  contaId: number;
  valor: number;
  combinacaoId: string; // UUID como string
}

export interface TransferenciaForm {
  contaOrigemId: number;
  contaDestinoId: number;
  valor: number;
}

export interface PagamentoForm {
  contaId: number;
  valorTotal: number;
  quantidadeParcelas: number;
  periodicidadeDias: number;
  dataInicio: string;
  descricao?: string;
}

// Tipos para API responses
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  login: string;
  email: string;
  perfil: 'ADMIN' | 'CLIENTE';
}

export interface ExtratoResponse {
  operacoes: Operacao[];
  saldoAtual: number;
  totalPages: number;
  currentPage: number;
}
