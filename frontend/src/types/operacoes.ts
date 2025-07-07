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
