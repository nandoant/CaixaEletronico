import { DepositoRequest, DepositoResponse, SaqueRequest, SaqueOpcoesResponse, SaqueConfirmacaoRequest, SaqueResponse, TransferenciaRequest, TransferenciaResponse, ContaInfo } from '../types/operacoes';

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

  /**
   * Busca informações de uma conta pelo número da conta
   */
  async buscarContaPorNumero(numeroConta: string): Promise<ContaInfo> {
    // Simular delay de rede
    await this.delay(800);

    // Contas mock para teste de transferência
    const contasMock: ContaInfo[] = [
      {
        contaId: 2,
        numeroConta: "2025000002",
        titular: "Maria Santos",
        usuarioProprietario: "cliente2",
        usuarioProprietarioId: 3
      },
      {
        contaId: 3,
        numeroConta: "2025000003",
        titular: "Pedro Oliveira",
        usuarioProprietario: "cliente3",
        usuarioProprietarioId: 4
      },
      {
        contaId: 4,
        numeroConta: "2025000004",
        titular: "Ana Costa",
        usuarioProprietario: "cliente4",
        usuarioProprietarioId: 5
      },
      {
        contaId: 5,
        numeroConta: "2025000005",
        titular: "Carlos Silva",
        usuarioProprietario: "cliente5",
        usuarioProprietarioId: 6
      },
      {
        contaId: 6,
        numeroConta: "2025000006",
        titular: "Fernanda Lima",
        usuarioProprietario: "cliente6",
        usuarioProprietarioId: 7
      },
      {
        contaId: 7,
        numeroConta: "2025000007",
        titular: "Roberto Ferreira",
        usuarioProprietario: "cliente7",
        usuarioProprietarioId: 8
      },
      {
        contaId: 8,
        numeroConta: "2025000008",
        titular: "Juliana Alves",
        usuarioProprietario: "cliente8",
        usuarioProprietarioId: 9
      }
    ];

    const conta = contasMock.find(c => c.numeroConta === numeroConta);

    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    return conta;
  }

  /**
   * Realiza uma transferência entre contas
   * 
   * INTEGRAÇÃO BACKEND - INFORMAÇÕES PARA IMPLEMENTAÇÃO FUTURA:
   * 
   * Endpoint: POST /operacoes/transferencia
   * Headers: 
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   * 
   * Request body:
   * {
   *   "contaOrigemId": 1,
   *   "contaDestinoId": 2,
   *   "valor": 150
   * }
   */
  async realizarTransferencia(request: TransferenciaRequest): Promise<TransferenciaResponse> {
    // Simular delay de rede
    await this.delay(1500);

    // Buscar dados das contas para resposta realista
    const contasMock = [
      { contaId: 1, numeroConta: "2025000001", titular: "João Silva", usuarioProprietario: "cliente_teste", usuarioProprietarioId: 2 },
      { contaId: 2, numeroConta: "2025000002", titular: "Maria Santos", usuarioProprietario: "cliente2", usuarioProprietarioId: 3 },
      { contaId: 3, numeroConta: "2025000003", titular: "Pedro Oliveira", usuarioProprietario: "cliente3", usuarioProprietarioId: 4 },
      { contaId: 4, numeroConta: "2025000004", titular: "Ana Costa", usuarioProprietario: "cliente4", usuarioProprietarioId: 5 },
      { contaId: 5, numeroConta: "2025000005", titular: "Carlos Silva", usuarioProprietario: "cliente5", usuarioProprietarioId: 6 },
      { contaId: 6, numeroConta: "2025000006", titular: "Fernanda Lima", usuarioProprietario: "cliente6", usuarioProprietarioId: 7 },
      { contaId: 7, numeroConta: "2025000007", titular: "Roberto Ferreira", usuarioProprietario: "cliente7", usuarioProprietarioId: 8 },
      { contaId: 8, numeroConta: "2025000008", titular: "Juliana Alves", usuarioProprietario: "cliente8", usuarioProprietarioId: 9 }
    ];

    const contaOrigem = contasMock.find(c => c.contaId === request.contaOrigemId);
    const contaDestino = contasMock.find(c => c.contaId === request.contaDestinoId);

    if (!contaOrigem) {
      throw new Error('Conta de origem não encontrada');
    }

    if (!contaDestino) {
      throw new Error('Conta de destino não encontrada');
    }

    // Simular resposta realista do backend
    const response: TransferenciaResponse = {
      contaDestino: {
        contaId: contaDestino.contaId,
        numeroConta: contaDestino.numeroConta,
        titular: contaDestino.titular,
        usuarioProprietario: contaDestino.usuarioProprietario,
        usuarioProprietarioId: contaDestino.usuarioProprietarioId,
        saldo: null
      },
      contaOrigem: {
        contaId: contaOrigem.contaId,
        numeroConta: contaOrigem.numeroConta,
        titular: contaOrigem.titular,
        usuarioProprietario: contaOrigem.usuarioProprietario,
        usuarioProprietarioId: contaOrigem.usuarioProprietarioId,
        saldo: null
      },
      dados: {
        operacao: {
          valor: request.valor,
          dataHora: new Date().toISOString(),
          status: "CONCLUIDA",
          tipo: "TRANSFERENCIA"
        }
      },
      message: "Transferência realizada com sucesso",
      timestamp: new Date().toISOString()
    };

    return response;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const operacoesService = new OperacoesService();
