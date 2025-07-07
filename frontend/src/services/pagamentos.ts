import api from './api';
import type {
  PagamentoAgendado,
  PagamentoForm,
  ApiResponse
} from '@/types';

export const pagamentosService = {
  async agendar(data: PagamentoForm): Promise<ApiResponse<PagamentoAgendado>> {
    const response = await api.post('/pagamentos/agendar', data);
    return response.data;
  },

  async obterPendentes(): Promise<PagamentoAgendado[]> {
    const response = await api.get('/pagamentos/pendentes');
    return response.data;
  },

  async obterHistorico(): Promise<PagamentoAgendado[]> {
    const response = await api.get('/pagamentos/historico');
    return response.data;
  },

  async cancelar(id: number): Promise<ApiResponse<any>> {
    const response = await api.put(`/pagamentos/${id}/cancelar`);
    return response.data;
  }
};
