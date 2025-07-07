import { DepositoRequest, DepositoResponse } from '../types/operacoes';

/**
 * INTEGRAÇÃO BACKEND - INFORMAÇÕES PARA IMPLEMENTAÇÃO FUTURA:
 * 
 * Endpoint: POST /operacoes/deposito
 * Headers: 
 *   - Authorization: Bearer {token}
 *   - Content-Type: application/json
 * 
 * Request body:
 * {
 *   "contaId": 1,
 *   "valor": 110,
 *   "cedulas": {
 *     "DEZ": 1,
 *     "CEM": 1
 *   }
 * }
 * 
 * Response:
 * {
 *   "dados": {
 *     "novoSaldoDisponivel": true,
 *     "operacao": {
 *       "tipo": "DEPOSITO",
 *       "valor": 110,
 *       "dataHora": "2025-07-07T20:51:05.176039953",
 *       "status": "CONCLUIDA"
 *     }
 *   },
 *   "conta": {
 *     "contaId": 1,
 *     "numeroConta": "2025000001",
 *     "titular": "João Silva",
 *     "usuarioProprietario": "cliente",
 *     "usuarioProprietarioId": 2,
 *     "saldo": null
 *   },
 *   "message": "Depósito realizado com sucesso",
 *   "timestamp": "2025-07-07T20:51:05.176110917"
 * }
 */

class OperacoesService {
  /**
   * Realiza um depósito
   * @param dados Dados do depósito
   * @returns Promise com a resposta da operação
   */
  async realizarDeposito(dados: DepositoRequest): Promise<DepositoResponse> {
    // TODO: Substituir por chamada real à API quando integrar com backend
    // const response = await fetch('/operacoes/deposito', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(dados)
    // });
    // return response.json();

    // MOCK - Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simula resposta de sucesso
    const mockResponse: DepositoResponse = {
      dados: {
        novoSaldoDisponivel: true,
        operacao: {
          tipo: 'DEPOSITO',
          valor: dados.valor,
          dataHora: new Date().toISOString(),
          status: 'CONCLUIDA'
        }
      },
      conta: {
        contaId: dados.contaId,
        numeroConta: '2025000001',
        titular: 'João Silva',
        usuarioProprietario: 'cliente',
        usuarioProprietarioId: 2,
        saldo: null
      },
      message: 'Depósito realizado com sucesso',
      timestamp: new Date().toISOString()
    };

    // Simula possível erro (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('Erro ao processar depósito. Tente novamente.');
    }

    return mockResponse;
  }
}

export const operacoesService = new OperacoesService();
