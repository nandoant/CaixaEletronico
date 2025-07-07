import { DepositoRequest, DepositoResponse, SaqueRequest, SaqueOpcoesResponse, SaqueConfirmacaoRequest, SaqueResponse } from '../types/operacoes';

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
 * 
 * SAQUE - ENDPOINTS:
 * 
 * 1. Solicitar opções de saque:
 * Endpoint: POST /operacoes/saque/opcoes
 * Request: { "contaId": 1, "valor": 250 }
 * 
 * 2. Confirmar saque:
 * Endpoint: POST /operacoes/saque/confirmar
 * Request: { "contaId": 1, "valor": 250, "idOpcao": "uuid" }
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

  /**
   * Solicita opções de saque
   * @param dados Dados da solicitação de saque
   * @returns Promise com as opções de saque disponíveis
   */
  async solicitarOpcoesSaque(dados: SaqueRequest): Promise<SaqueOpcoesResponse> {
    // TODO: Substituir por chamada real à API quando integrar com backend
    // const response = await fetch('/operacoes/saque/opcoes', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(dados)
    // });
    // return response.json();

    // MOCK - Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verifica se o valor é múltiplo de 10
    if (dados.valor % 10 !== 0) {
      throw new Error('O valor deve ser múltiplo de R$ 10,00');
    }

    // Verifica valor mínimo
    if (dados.valor < 10) {
      throw new Error('O valor mínimo para saque é R$ 10,00');
    }

    // Simula saldo insuficiente para valores muito altos
    const saldoSuficiente = dados.valor <= 5000;

    if (!saldoSuficiente) {
      const mockResponse: SaqueOpcoesResponse = {
        dados: {
          valorSolicitado: dados.valor,
          opcoes: [],
          totalOpcoes: 0,
          saldoSuficiente: false
        },
        conta: {
          contaId: dados.contaId,
          numeroConta: '2025000001',
          titular: 'João Silva',
          usuarioProprietario: 'cliente',
          usuarioProprietarioId: 2,
          saldo: null
        },
        message: 'Saldo insuficiente para o valor solicitado',
        timestamp: new Date().toISOString()
      };
      return mockResponse;
    }

    // Gera opções mock baseadas no valor
    const opcoes = this.gerarOpcoesSaqueMock(dados.valor);

    const mockResponse: SaqueOpcoesResponse = {
      dados: {
        valorSolicitado: dados.valor,
        opcoes,
        totalOpcoes: opcoes.length,
        saldoSuficiente: true
      },
      conta: {
        contaId: dados.contaId,
        numeroConta: '2025000001',
        titular: 'João Silva',
        usuarioProprietario: 'cliente',
        usuarioProprietarioId: 2,
        saldo: null
      },
      message: 'Opções de saque calculadas com sucesso',
      timestamp: new Date().toISOString()
    };

    return mockResponse;
  }

  /**
   * Confirma o saque com a opção escolhida
   * @param dados Dados da confirmação do saque
   * @returns Promise com a resposta da operação
   */
  async confirmarSaque(dados: SaqueConfirmacaoRequest): Promise<SaqueResponse> {
    // TODO: Substituir por chamada real à API quando integrar com backend
    // const response = await fetch('/operacoes/saque/confirmar', {
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

    // Busca a combinação escolhida (simulado)
    const combinacaoEscolhida = this.obterDescricaoCombinacao(dados.idOpcao, dados.valor);

    const mockResponse: SaqueResponse = {
      dados: {
        operacao: {
          status: 'CONCLUIDA',
          combinacaoEscolhida,
          dataHora: new Date().toISOString(),
          valor: dados.valor,
          tipo: 'SAQUE'
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
      message: 'Saque realizado com sucesso',
      timestamp: new Date().toISOString()
    };

    // Simula possível erro (3% de chance)
    if (Math.random() < 0.03) {
      throw new Error('Erro ao processar saque. Tente novamente.');
    }

    return mockResponse;
  }

  /**
   * Gera opções de saque mock baseadas no valor
   */
  private gerarOpcoesSaqueMock(valor: number) {
    const opcoes = [];
    
    // Opção 1: Usar as maiores cédulas possíveis
    if (valor >= 50) {
      const duzentos = Math.floor(valor / 200);
      const resto1 = valor % 200;
      const cinquenta = Math.floor(resto1 / 50);
      const resto2 = resto1 % 50;
      const dez = Math.floor(resto2 / 10);
      
      const mapaCedulas: any = {};
      let descricao = [];
      
      if (duzentos > 0) {
        mapaCedulas.DUZENTOS = duzentos;
        descricao.push(`${duzentos}x R$200`);
      }
      if (cinquenta > 0) {
        mapaCedulas.CINQUENTA = cinquenta;
        descricao.push(`${cinquenta}x R$50`);
      }
      if (dez > 0) {
        mapaCedulas.DEZ = dez;
        descricao.push(`${dez}x R$10`);
      }
      
      opcoes.push({
        idOpcao: `opt1-${Date.now()}`,
        mapaCedulas,
        quantidadeTotalDeNotas: duzentos + cinquenta + dez,
        descricaoLegivel: descricao.join(', ')
      });
    }
    
    // Opção 2: Usar mais cédulas de 20
    if (valor >= 20) {
      const vinte = Math.floor(valor / 20);
      const resto = valor % 20;
      const dez = Math.floor(resto / 10);
      
      const mapaCedulas: any = {};
      let descricao = [];
      
      if (vinte > 0) {
        mapaCedulas.VINTE = vinte;
        descricao.push(`${vinte}x R$20`);
      }
      if (dez > 0) {
        mapaCedulas.DEZ = dez;
        descricao.push(`${dez}x R$10`);
      }
      
      opcoes.push({
        idOpcao: `opt2-${Date.now()}`,
        mapaCedulas,
        quantidadeTotalDeNotas: vinte + dez,
        descricaoLegivel: descricao.join(', ')
      });
    }
    
    // Opção 3: Usar cédulas menores (apenas se valor permitir)
    if (valor <= 200) {
      const dez = Math.floor(valor / 10);
      
      opcoes.push({
        idOpcao: `opt3-${Date.now()}`,
        mapaCedulas: { DEZ: dez },
        quantidadeTotalDeNotas: dez,
        descricaoLegivel: `${dez}x R$10`
      });
    }
    
    return opcoes;
  }

  /**
   * Obtém descrição da combinação baseada no ID da opção
   */
  private obterDescricaoCombinacao(idOpcao: string, valor: number): string {
    // Em um cenário real, isso viria do backend
    // Aqui vamos simular baseado no tipo de opção
    if (idOpcao.includes('opt1')) {
      return 'Combinação com cédulas maiores';
    } else if (idOpcao.includes('opt2')) {
      return 'Combinação com cédulas de R$20';
    } else {
      return 'Combinação com cédulas de R$10';
    }
  }
}

export const operacoesService = new OperacoesService();
