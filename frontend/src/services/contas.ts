import api from './api';
import type {
  Conta,
  ExtratoResponse,
  ApiResponse
} from '@/types';

export const contasService = {
  async obterContas(): Promise<Conta[]> {
    try {
      console.log('Fazendo requisição para /contas/minhas-contas...');
      const response = await api.get('/contas/minhas-contas');
      console.log('Resposta recebida:', response.data);

      if (!response.data || !response.data.contas) {
        console.warn('Estrutura de resposta inesperada:', response.data);
        return [];
      }

      return response.data.contas;
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw error;
    }
  },

  async obterTodasContas(): Promise<Conta[]> {
    try {
      console.log('Fazendo requisição para /contas/todas-contas...');
      const response = await api.get('/contas/todas-contas');
      console.log('Resposta recebida:', response.data);

      if (!response.data || !response.data.contas) {
        console.warn('Estrutura de resposta inesperada:', response.data);
        return [];
      }

      return response.data.contas;
    } catch (error) {
      console.error('Erro ao buscar todas as contas:', error);
      // Se falhar, tenta buscar apenas as próprias contas
      return this.obterContas();
    }
  },

  async obterExtrato(
    contaId: number,
    dataInicio?: string,
    dataFim?: string,
    limite?: number
  ): Promise<ExtratoResponse> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    if (limite) params.append('limite', limite.toString());

    const response = await api.get(`/contas/${contaId}/extrato?${params.toString()}`);
    return response.data;
  },

  async obterSaldo(contaId: number): Promise<number> {
    const response = await api.get(`/contas/${contaId}/saldo`);
    return response.data.saldo;
  }
};
