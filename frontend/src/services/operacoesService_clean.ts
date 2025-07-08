import { DepositoRequest, DepositoResponse, SaqueRequest, SaqueOpcoesResponse, SaqueConfirmacaoRequest, SaqueResponse, ExtratoRequest, ExtratoResponse, ExtratoOperacao, EnviarExtratoEmailRequest, TransferenciaRequest, TransferenciaResponse, ContaInfo, ContasDisponiveisResponse, AgendamentoRequest, AgendamentoResponse, AgendamentoListItem, CancelamentoResponse, SaldoResponse, ExtratoFiltros, ExtratoNovoResponse, ExtratoBackendResponse } from '../types/operacoes';
import { httpClient } from './httpClient';

export interface PagamentoAgendado {
  id: number;
  contaOrigemId: number;
  contaDestinoId: number;
  valorTotal: number;
  valorParcela: number;
  quantidadeParcelas: number;
  parcelasRestantes: number;
  periodicidadeDias: number;
  dataProximaExecucao: string;
  status: 'CONCLUIDO' | 'ATIVO' | 'CANCELADO';
  descricao: string;
}

export interface PagamentosAgendadosResponse {
  pagamentosRecebidos: PagamentoAgendado[];
  contaId: number;
  pagamentosEnviados: PagamentoAgendado[];
}

class OperacoesService {
  async realizarDeposito(dados: DepositoRequest): Promise<DepositoResponse> {
    try {
      const response = await httpClient.post<DepositoResponse>('/operacoes/deposito', dados);
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao realizar depósito. Tente novamente.');
      }
    }
  }

  async solicitarOpcoesSaque(dados: SaqueRequest): Promise<SaqueOpcoesResponse> {
    try {
      if (!dados.contaId || !dados.valor || dados.valor <= 0) {
        throw new Error('Conta e valor são obrigatórios para solicitar opções de saque');
      }

      const response = await httpClient.post<SaqueOpcoesResponse>('/operacoes/saque/opcoes', dados);
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao solicitar opções de saque. Tente novamente.');
      }
    }
  }

  async confirmarSaque(dados: SaqueConfirmacaoRequest): Promise<SaqueResponse> {
    try {
      const response = await httpClient.post<SaqueResponse>('/operacoes/saque', dados);
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao confirmar saque. Tente novamente.');
      }
    }
  }

  async obterExtrato(dados: ExtratoRequest): Promise<ExtratoResponse> {
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
        dataHora: '2025-07-04T11:22:44.456789',
        valor: 150,
        usuarioResponsavel: 'cliente',
        descricao: 'Saque no caixa eletrônico'
      },
      {
        id: 11,
        tipo: 'DEPOSITO',
        dataHora: '2025-07-03T08:05:55.321654',
        valor: 300,
        usuarioResponsavel: 'cliente',
        descricao: 'Depósito em cheque'
      }
    ];

    const extratoFiltrado = operacoesMock.filter(op => {
      const dataOp = new Date(op.dataHora);
      const dataInicio = new Date(dados.dataInicio);
      const dataFim = new Date(dados.dataFim);
      
      return dataOp >= dataInicio && dataOp <= dataFim;
    }).slice(0, dados.limite);

    return {
      dados: {
        periodo: {
          dataInicio: dados.dataInicio,
          dataFim: dados.dataFim
        },
        operacoes: extratoFiltrado,
        totalOperacoes: extratoFiltrado.length
      },
      conta: {
        contaId: 1,
        numeroConta: "123456",
        titular: "Mock User",
        usuarioProprietario: "mockuser",
        usuarioProprietarioId: 1,
        saldo: 1000
      },
      message: "Extrato gerado com sucesso",
      timestamp: new Date().toISOString()
    };
  }

  async enviarExtratoPorEmail(dados: EnviarExtratoEmailRequest): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));

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

  async buscarContaPorNumero(numeroConta: string): Promise<ContaInfo> {
    try {
      const contasResponse = await this.buscarContasDisponiveis();

      const conta = contasResponse.dados.contas.find(c => c.numeroConta === numeroConta);

      if (!conta) {
        throw new Error('Conta não encontrada');
      }

      return conta;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao buscar conta. Tente novamente.');
      }
    }
  }

  async realizarTransferencia(request: TransferenciaRequest): Promise<TransferenciaResponse> {
    try {
      const response = await httpClient.post<TransferenciaResponse>('/operacoes/transferencia', request);
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao realizar transferência. Tente novamente.');
      }
    }
  }

  async criarAgendamento(request: AgendamentoRequest): Promise<AgendamentoResponse> {
    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        const tokenParts = token.split('.');

        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));

          if (payload.exp && payload.exp * 1000 < Date.now()) {
            throw new Error('Token expirado. Faça login novamente.');
          }
        }
      } catch (tokenError) {
        console.error('Erro ao decodificar token:', tokenError);
      }
    } else {
      throw new Error('Nenhum token de autenticação encontrado. Faça login novamente.');
    }

    try {
      try {
        const contasDisponiveis = await this.buscarContasDisponiveis();
        const contaDestino = contasDisponiveis.dados.contas.find(c => c.contaId === request.contaDestinoId);

        if (!contaDestino) {
          throw new Error(`Conta de destino ID ${request.contaDestinoId} não encontrada`);
        }
      } catch (validationError: any) {
        console.warn('Não foi possível validar conta de destino:', validationError.message);
      }

      const response = await httpClient.post<AgendamentoResponse>('/pagamentos/agendar', request);

      if (!response.dados || !response.dados.agendamento) {
        throw new Error('Resposta inválida da API - estrutura inesperada');
      }

      return response;

    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        let mensagemBackend = error.message;

        const prefixosParaRemover = [
          'Erro na requisição (HTTP 403)',
          'HTTP 403:',
          '(HTTP 403)',
          'Forbidden:'
        ];

        for (const prefixo of prefixosParaRemover) {
          if (mensagemBackend.includes(prefixo)) {
            mensagemBackend = mensagemBackend.replace(prefixo, '').trim();
          }
        }

        const mensagemFinal = mensagemBackend && mensagemBackend.length > 10
          ? `${mensagemBackend}`
          : 'Acesso negado ao criar agendamento. Verifique se você é o proprietário da conta de origem.';

        throw new Error(mensagemFinal);
      }

      if (error.message?.includes('404')) {
        throw new Error('Serviço de agendamento não disponível. Contate o suporte.');
      }

      if (error.message?.includes('500')) {
        throw new Error('Erro interno do servidor. Tente novamente em alguns instantes.');
      }

      if (error.message?.includes('fetch')) {
        throw new Error('Erro de conectividade. Verifique sua conexão com a internet.');
      }

      throw new Error(error.message || 'Erro inesperado ao criar agendamento. Verifique os logs do console.');
    }
  }

  async criarAgendamentoMock(request: AgendamentoRequest): Promise<AgendamentoResponse> {
    await this.delay(2000);

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

    const contaOrigem = contasMock.find(c => c.contaId === 1);
    const contaDestino = contasMock.find(c => c.contaId === request.contaDestinoId);

    if (!contaOrigem) {
      throw new Error('Conta de origem não encontrada');
    }

    if (!contaDestino) {
      throw new Error('Conta de destino não encontrada');
    }

    const valorParcela = request.valorTotal / request.quantidadeParcelas;
    const valorDebitadoAgora = request.debitarPrimeiraParcela ? valorParcela : 0;

    const dataInicio = new Date(request.dataInicio);
    let dataProximaExecucao: Date;

    if (request.debitarPrimeiraParcela && request.quantidadeParcelas > 1) {
      dataProximaExecucao = new Date(dataInicio);
      dataProximaExecucao.setDate(dataProximaExecucao.getDate() + request.periodicidadeDias);
    } else if (!request.debitarPrimeiraParcela) {
      dataProximaExecucao = dataInicio;
    } else {
      dataProximaExecucao = dataInicio;
    }

    let status: 'CONCLUIDO' | 'ATIVO' | 'CANCELADO';
    if (request.quantidadeParcelas === 1 && request.debitarPrimeiraParcela) {
      status = 'CONCLUIDO';
    } else {
      status = 'ATIVO';
    }

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
          id: Math.floor(Math.random() * 1000) + 1,
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

  async listarAgendamentos(): Promise<AgendamentoListItem[]> {
    await this.delay(1200);

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

  async cancelarAgendamento(id: number): Promise<CancelamentoResponse> {
    try {
      const response = await httpClient.post<CancelamentoResponse>(`/pagamentos/${id}/cancelar`);
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro ao cancelar agendamento.');
      }
    }
  }

  async consultarSaldo(contaId: number): Promise<SaldoResponse> {
    try {
      const response = await httpClient.get<SaldoResponse>(`/contas/${contaId}/saldo`);
      return response;
    } catch (error: any) {
      console.warn('Erro ao consultar saldo no backend, usando dados mock:', error.message);

      await this.delay(800);

      const response: SaldoResponse = {
        dados: {
          dataConsulta: new Date().toISOString()
        },
        conta: {
          contaId: contaId,
          numeroConta: "2025000001",
          titular: "João Silva",
          usuarioProprietario: "cliente",
          usuarioProprietarioId: 2,
          saldo: 4950.00
        },
        message: "Saldo consultado com sucesso",
        timestamp: new Date().toISOString()
      };

      return response;
    }
  }

  async buscarContasDisponiveis(): Promise<ContasDisponiveisResponse> {
    try {
      const response = await httpClient.get<ContasDisponiveisResponse>('/auth/contas-disponiveis');
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao buscar contas disponíveis. Tente novamente.');
      }
    }
  }

  async testarPermissoes(): Promise<{ [key: string]: boolean }> {
    const resultados: { [key: string]: boolean } = {};

    const endpoints = [
      { nome: 'buscarContasDisponiveis', metodo: () => this.buscarContasDisponiveis() },
      { nome: 'consultarSaldo', metodo: () => this.consultarSaldo(1) },
      { nome: 'listarAgendamentos', metodo: () => this.listarAgendamentos() },
      {
        nome: 'realizarTransferencia',
        metodo: () => this.realizarTransferencia({ contaOrigemId: 1, contaDestinoId: 2, valor: 0.01 }),
        nota: 'Teste com valor mínimo - pode falhar por regras de negócio'
      },
    ];

    for (const endpoint of endpoints) {
      try {
        await endpoint.metodo();
        resultados[endpoint.nome] = true;
      } catch (error: any) {
        resultados[endpoint.nome] = false;
      }
    }

    const sucessos = Object.values(resultados).filter(Boolean).length;
    const total = Object.keys(resultados).length;

    return resultados;
  }

  async testarAgendamentoMinimo(): Promise<boolean> {
    try {
      const contasDisponiveis = await this.buscarContasDisponiveis();
      if (contasDisponiveis.dados.contas.length < 2) {
        throw new Error('Precisa de pelo menos 2 contas no sistema para testar agendamento');
      }

      const contaUsuario = contasDisponiveis.dados.contas[0];
      const contaDestino = contasDisponiveis.dados.contas[1];

      const requestTeste: AgendamentoRequest = {
        contaDestinoId: contaDestino.contaId,
        valorTotal: 0.01,
        quantidadeParcelas: 1,
        periodicidadeDias: 30,
        debitarPrimeiraParcela: false,
        descricao: 'TESTE - Agendamento de diagnóstico',
        dataInicio: new Date().toISOString().split('T')[0]
      };

      const response = await httpClient.post<AgendamentoResponse>('/pagamentos/agendar', requestTeste);

      return true;

    } catch (error: any) {
      return false;
    }
  }

  async listarPagamentosAgendados(contaId: number): Promise<PagamentosAgendadosResponse> {
    try {
      const response = await httpClient.get<PagamentosAgendadosResponse>(`/pagamentos/conta/${contaId}/todos`);
      return response;
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro ao buscar pagamentos agendados.');
      }
    }
  }

  async obterExtratoNovo(contaId: number, filtros?: ExtratoFiltros): Promise<ExtratoNovoResponse> {
    try {
      const params = new URLSearchParams();
      if (filtros?.dataInicio) {
        params.append('dataInicio', filtros.dataInicio);
      }
      if (filtros?.dataFim) {
        params.append('dataFim', filtros.dataFim);
      }
      if (filtros?.limite) {
        params.append('limite', filtros.limite.toString());
      }

      const url = `/contas/${contaId}/extrato${params.toString() ? `?${params.toString()}` : ''}`;

      const backendResponse = await httpClient.get<ExtratoBackendResponse>(url);

      const mappedResponse: ExtratoNovoResponse = {
        contaId: backendResponse.conta.contaId,
        titular: backendResponse.conta.titular,
        saldoAtual: backendResponse.conta.saldo,
        operacoes: backendResponse.dados.operacoes,
        totalOperacoes: backendResponse.dados.totalOperacoes
      };

      return mappedResponse;
    } catch (error) {
      throw new Error(`Erro ao carregar extrato: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique se o backend está rodando e o endpoint está implementado.`);
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const operacoesService = new OperacoesService();
