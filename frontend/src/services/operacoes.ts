import api from './api';
import type { 
  DepositoForm, 
  SaqueForm, 
  TransferenciaForm, 
  CombinacaoCedulas,
  ApiResponse 
} from '@/types';

export const operacoesService = {
  async depositar(data: DepositoForm): Promise<ApiResponse<any>> {
    console.log('Enviando dados de depósito:', data);
    const response = await api.post('/operacoes/deposito', data);
    return response.data;
  },

  async obterOpcoesSaque(contaId: number, valor: number): Promise<CombinacaoCedulas[]> {
    console.log('Buscando opções de saque:', { contaId, valor });
    const response = await api.get(`/operacoes/saque/opcoes?contaId=${contaId}&valor=${valor}`);
    return response.data.opcoes;
  },

  async sacar(data: SaqueForm): Promise<ApiResponse<any>> {
    console.log('Enviando dados de saque:', data);
    // Ajustar dados para corresponder ao DTO do backend
    const requestData = {
      contaId: data.contaId,
      valor: data.valor,
      idOpcao: data.combinacaoId
    };
    const response = await api.post('/operacoes/saque', requestData);
    return response.data;
  },

  async transferir(data: TransferenciaForm): Promise<ApiResponse<any>> {
    console.log('Enviando dados de transferência:', data);
    const response = await api.post('/operacoes/transferencia', data);
    return response.data;
  }
};
