import { DepositoRequest, DepositoResponse, SaqueRequest, SaqueOpcoesResponse, SaqueConfirmacaoRequest, SaqueResponse, ExtratoRequest, ExtratoResponse, ExtratoOperacao, EnviarExtratoEmailRequest, TransferenciaRequest, TransferenciaResponse, ContaInfo, AgendamentoRequest, AgendamentoResponse, AgendamentoListItem, CancelamentoResponse } from '../types/operacoes';

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
   * Obtém o extrato de operações
   * @param dados Dados para filtrar o extrato
   * @returns Promise com o extrato
   */
  async obterExtrato(dados: ExtratoRequest): Promise<ExtratoResponse> {
    // Simulação de dados mockados
    await new Promise(resolve => setTimeout(resolve, 1000));

    const operacoesMock: ExtratoOperacao[] = [
      {
        id: 15,
        tipo: 'DEPOSITO',
        dataHora: '2025-07-07T14:30:22.123456',
        valor: 500,
        usuarioResponsavel: 'cliente',
        descricao: 'Depósito em dinheiro'
      },
      {
        id: 14,
        tipo: 'SAQUE',
        dataHora: '2025-07-06T16:45:10.654321',
        valor: 200,
        usuarioResponsavel: 'cliente',
        descricao: 'Saque no caixa eletrônico'
      },
      {
        id: 13,
        tipo: 'DEPOSITO',
        dataHora: '2025-07-05T09:15:33.789012',
        valor: 1000,
        usuarioResponsavel: 'cliente',
        descricao: 'Transferência recebida'
      },
      {
        id: 12,
        tipo: 'SAQUE',
        dataHora: '2025-07-04T18:20:45.345678',
        valor: 150,
        usuarioResponsavel: 'cliente',
        descricao: 'Saque no caixa eletrônico'
      },
      {
        id: 11,
        tipo: 'DEPOSITO',
        dataHora: '2025-07-03T11:30:15.567890',
        valor: 300,
        usuarioResponsavel: 'cliente',
        descricao: 'Depósito em cheque'
      },
      {
        id: 10,
        tipo: 'SAQUE',
        dataHora: '2025-07-02T20:10:30.234567',
        valor: 80,
        usuarioResponsavel: 'cliente',
        descricao: 'Saque no caixa eletrônico'
      },
      {
        id: 9,
        tipo: 'DEPOSITO',
        dataHora: '2025-07-01T15:45:20.890123',
        valor: 750,
        usuarioResponsavel: 'cliente',
        descricao: 'Depósito em dinheiro'
      }
    ];

    const response: ExtratoResponse = {
      dados: {
        periodo: {
          dataInicio: `${dados.dataInicio}T00:00:00`,
          dataFim: `${dados.dataFim}T23:59:59`
        },
        operacoes: operacoesMock.slice(0, dados.limite),
        totalOperacoes: operacoesMock.length
      },
      conta: {
        contaId: 1,
        numeroConta: '2025000001',
        titular: 'João Silva',
        usuarioProprietario: 'cliente',
        usuarioProprietarioId: dados.id,
        saldo: 4860
      },
      message: 'Extrato obtido com sucesso',
      timestamp: new Date().toISOString()
    };

    return response;
  }

  /**
   * Envia extrato por email
   * @param dados Dados para enviar o extrato
   * @returns Promise com resultado do envio
   */
  async enviarExtratoPorEmail(dados: EnviarExtratoEmailRequest): Promise<{ success: boolean; message: string }> {
    // Simulação de envio de email
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular sucesso na maioria das vezes
    const sucesso = Math.random() > 0.1;

    if (sucesso) {
      return {
        success: true,
        message: 'Extrato enviado por email com sucesso!'
      };
    } else {
      throw new Error('Erro ao enviar extrato por email. Tente novamente.');
    }
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

  /**
   * Cria um agendamento de pagamento
   * 
   * INTEGRAÇÃO BACKEND - INFORMAÇÕES PARA IMPLEMENTAÇÃO FUTURA:
   * 
   * Endpoint: POST /operacoes/agendamento
   * Headers: 
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   * 
   * Request body:
   * {
   *   "contaDestinoId": 5,
   *   "valorTotal": 100,
   *   "quantidadeParcelas": 1,
   *   "periodicidadeDias": 30,
   *   "debitarPrimeiraParcela": true,
   *   "descricao": "Pagamento único",
   *   "dataInicio": "2025-07-07"
   * }
   */
  async criarAgendamento(request: AgendamentoRequest): Promise<AgendamentoResponse> {
    // Simular delay de rede
    await this.delay(2000);

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

    // Assumindo que a conta origem é sempre a conta 1 (usuário logado)
    const contaOrigem = contasMock.find(c => c.contaId === 1);
    const contaDestino = contasMock.find(c => c.contaId === request.contaDestinoId);

    if (!contaOrigem) {
      throw new Error('Conta de origem não encontrada');
    }

    if (!contaDestino) {
      throw new Error('Conta de destino não encontrada');
    }

    // Calcular valor da parcela
    const valorParcela = request.valorTotal / request.quantidadeParcelas;
    
    // Calcular valor debitado agora
    const valorDebitadoAgora = request.debitarPrimeiraParcela ? valorParcela : 0;

    // Calcular data da próxima execução
    const dataInicio = new Date(request.dataInicio);
    let dataProximaExecucao: Date;
    
    if (request.debitarPrimeiraParcela && request.quantidadeParcelas > 1) {
      // Se debita primeira parcela e há mais parcelas, próxima é após periodicidade
      dataProximaExecucao = new Date(dataInicio);
      dataProximaExecucao.setDate(dataProximaExecucao.getDate() + request.periodicidadeDias);
    } else if (!request.debitarPrimeiraParcela) {
      // Se não debita primeira parcela, primeira execução é na data de início
      dataProximaExecucao = dataInicio;
    } else {
      // Se é pagamento único e já foi debitado, não há próxima execução
      dataProximaExecucao = dataInicio;
    }

    // Determinar status do agendamento
    let status: 'CONCLUIDO' | 'ATIVO' | 'CANCELADO';
    if (request.quantidadeParcelas === 1 && request.debitarPrimeiraParcela) {
      status = 'CONCLUIDO';
    } else {
      status = 'ATIVO';
    }

    // Simular resposta realista do backend
    const response: AgendamentoResponse = {
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
        valorDebitadoAgora,
        agendamento: {
          descricao: request.descricao,
          id: Math.floor(Math.random() * 1000) + 1, // ID simulado
          quantidadeParcelas: request.quantidadeParcelas,
          valorTotal: request.valorTotal,
          primeiraParcelaDebitada: request.debitarPrimeiraParcela,
          status,
          valorParcela: Number(valorParcela.toFixed(2)),
          dataProximaExecucao: dataProximaExecucao.toISOString().split('T')[0]
        }
      },
      message: "Transferência agendada com sucesso",
      timestamp: new Date().toISOString()
    };

    return response;
  }

  /**
   * Lista agendamentos do usuário (MOCK)
   * 
   * INTEGRAÇÃO BACKEND - INFORMAÇÕES PARA IMPLEMENTAÇÃO FUTURA:
   * 
   * Endpoint: GET /operacoes/agendamentos
   * Headers: 
   *   - Authorization: Bearer {token}
   * 
   * Query params:
   *   - status?: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO'
   *   - limit?: number
   */
  async listarAgendamentos(): Promise<AgendamentoListItem[]> {
    // Simular delay de rede
    await this.delay(1200);

    // Dados mock para teste
    const agendamentosMock: AgendamentoListItem[] = [
      {
        id: 1,
        descricao: "Pagamento de aluguel",
        contaDestino: {
          numeroConta: "2025000002",
          titular: "Maria Santos"
        },
        valorTotal: 1200.00,
        valorParcela: 1200.00,
        quantidadeParcelas: 12,
        parcelasRestantes: 10,
        periodicidadeDias: 30,
        dataProximaExecucao: "2025-08-07",
        dataCriacao: "2025-01-07",
        status: "ATIVO",
        primeiraParcelaDebitada: true
      },
      {
        id: 2,
        descricao: "Financiamento do carro",
        contaDestino: {
          numeroConta: "2025000003",
          titular: "Pedro Oliveira"
        },
        valorTotal: 3600.00,
        valorParcela: 600.00,
        quantidadeParcelas: 6,
        parcelasRestantes: 4,
        periodicidadeDias: 30,
        dataProximaExecucao: "2025-07-15",
        dataCriacao: "2025-02-15",
        status: "ATIVO",
        primeiraParcelaDebitada: true
      },
      {
        id: 3,
        descricao: "Pagamento de empréstimo",
        contaDestino: {
          numeroConta: "2025000004",
          titular: "Ana Costa"
        },
        valorTotal: 2400.00,
        valorParcela: 400.00,
        quantidadeParcelas: 6,
        parcelasRestantes: 0,
        periodicidadeDias: 30,
        dataProximaExecucao: "2025-06-15",
        dataCriacao: "2025-01-15",
        status: "CONCLUIDO",
        primeiraParcelaDebitada: true
      },
      {
        id: 4,
        descricao: "Mensalidade do curso",
        contaDestino: {
          numeroConta: "2025000005",
          titular: "Carlos Silva"
        },
        valorTotal: 500.00,
        valorParcela: 500.00,
        quantidadeParcelas: 1,
        parcelasRestantes: 0,
        periodicidadeDias: 30,
        dataProximaExecucao: "2025-06-20",
        dataCriacao: "2025-06-20",
        status: "CANCELADO",
        primeiraParcelaDebitada: false
      },
      {
        id: 5,
        descricao: "Pagamento semanal de serviços",
        contaDestino: {
          numeroConta: "2025000006",
          titular: "Fernanda Lima"
        },
        valorTotal: 280.00,
        valorParcela: 70.00,
        quantidadeParcelas: 4,
        parcelasRestantes: 2,
        periodicidadeDias: 7,
        dataProximaExecucao: "2025-07-14",
        dataCriacao: "2025-06-23",
        status: "ATIVO",
        primeiraParcelaDebitada: true
      }
    ];

    return agendamentosMock;
  }

  /**
   * Cancela um agendamento (MOCK)
   * 
   * INTEGRAÇÃO BACKEND - INFORMAÇÕES PARA IMPLEMENTAÇÃO FUTURA:
   * 
   * Endpoint: DELETE /operacoes/agendamentos/{id}
   * Headers: 
   *   - Authorization: Bearer {token}
   */
  async cancelarAgendamento(id: number): Promise<CancelamentoResponse> {
    // Simular delay de rede
    await this.delay(1500);

    // Simular 5% de chance de erro para teste
    if (Math.random() < 0.05) {
      throw new Error('Erro interno do servidor. Tente novamente.');
    }

    // Simular resposta de sucesso
    const response: CancelamentoResponse = {
      id,
      status: "CANCELADO",
      message: "Agendamento cancelado com sucesso",
      timestamp: new Date().toISOString()
    };

    return response;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const operacoesService = new OperacoesService();
