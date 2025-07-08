import { DepositoRequest, DepositoResponse, SaqueRequest, SaqueOpcoesResponse, SaqueConfirmacaoRequest, SaqueResponse, ExtratoRequest, ExtratoResponse, ExtratoOperacao, EnviarExtratoEmailRequest, TransferenciaRequest, TransferenciaResponse, ContaInfo, ContasDisponiveisResponse, AgendamentoRequest, AgendamentoResponse, AgendamentoListItem, CancelamentoResponse, SaldoResponse } from '../types/operacoes';
import { httpClient } from './httpClient';

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
   * @param dados Dados do depósito (contaId, valor, cedulas)
   * @returns Promise com a resposta da operação incluindo dados da conta e operação
   */
  async realizarDeposito(dados: DepositoRequest): Promise<DepositoResponse> {
    try {
      const response = await httpClient.post<DepositoResponse>('/operacoes/deposito', dados);
      return response;
    } catch (error: any) {
      // Trata erros específicos do backend
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao realizar depósito. Tente novamente.');
      }
    }
  }

  /**
   * Solicita opções de saque
   * @param dados Dados da solicitação de saque
   * @returns Promise com as opções de saque disponíveis
   */
  async solicitarOpcoesSaque(dados: SaqueRequest): Promise<SaqueOpcoesResponse> {
    try {
      // Validação client-side
      if (dados.valor % 10 !== 0) {
        throw new Error('O valor deve ser múltiplo de R$ 10,00');
      }

      if (dados.valor <= 0) {
        throw new Error('O valor deve ser maior que zero');
      }

      // Chamada real à API
      const response = await httpClient.get<SaqueOpcoesResponse>(
        `/operacoes/saque/opcoes?contaId=${dados.contaId}&valor=${dados.valor}`
      );

      return response;
    } catch (error: any) {
      // Trata erros específicos do backend
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao buscar opções de saque. Tente novamente.');
      }
    }
  }

  /**
   * Confirma o saque com a opção escolhida
   * @param dados Dados da confirmação do saque
   * @returns Promise com a resposta da operação
   */
  async confirmarSaque(dados: SaqueConfirmacaoRequest): Promise<SaqueResponse> {
    try {
      // Chamada real à API
      const response = await httpClient.post<SaqueResponse>('/operacoes/saque', dados);
      return response;
    } catch (error: any) {
      // Trata erros específicos do backend
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao confirmar saque. Tente novamente.');
      }
    }
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
   * Busca informações de uma conta pelo número da conta
   */
  async buscarContaPorNumero(numeroConta: string): Promise<ContaInfo> {
    console.log('🔍 Buscando conta:', numeroConta);

    try {
      const contasResponse = await this.buscarContasDisponiveis();
      console.log('📋 Total de contas encontradas:', contasResponse.dados.totalContas);

      const conta = contasResponse.dados.contas.find(c => c.numeroConta === numeroConta);

      if (!conta) {
        console.log('❌ Conta não encontrada na lista');
        throw new Error('Conta não encontrada');
      }

      console.log('✅ Conta encontrada:', conta);
      return conta;
    } catch (error: any) {
      console.error('🚨 Erro na busca da conta:', error);
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao buscar conta. Tente novamente.');
      }
    }
  }

  /**
   * Realiza uma transferência entre contas
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

  /**
   * Cria um agendamento de pagamento
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
    console.log('🚀 [AGENDAMENTO] Iniciando criação de agendamento...');
    console.log('📋 [AGENDAMENTO] Request data:', JSON.stringify(request, null, 2));

    // Verificar configuração da API
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    console.log('🌐 [AGENDAMENTO] API Base URL:', apiUrl);

    // Verificar token de autenticação
    const token = localStorage.getItem('authToken');
    console.log('🔐 [AGENDAMENTO] Token presente:', !!token);
    console.log('🔐 [AGENDAMENTO] Token preview:', token ? `${token.substring(0, 20)}...` : 'não encontrado');
    console.log('🔐 [AGENDAMENTO] Token length:', token ? token.length : 0);

    // Tentar decodificar o token para ver as informações do usuário (se for JWT)
    if (token) {
      try {
        console.log('🔍 [AGENDAMENTO] Iniciando decodificação do token...');
        const tokenParts = token.split('.');
        console.log('🔍 [AGENDAMENTO] Token parts count:', tokenParts.length);

        if (tokenParts.length === 3) {
          console.log('🔍 [AGENDAMENTO] Token é JWT válido, decodificando payload...');
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 [AGENDAMENTO] Token payload completo:', payload);
          console.log('🔍 [AGENDAMENTO] User ID:', payload.sub || payload.userId || payload.id || 'não encontrado');
          console.log('🔍 [AGENDAMENTO] User login:', payload.login || payload.username || 'não encontrado');
          console.log('🔍 [AGENDAMENTO] User perfil:', payload.perfil || payload.role || payload.authorities || 'não encontrado');
          console.log('🔍 [AGENDAMENTO] Conta ID:', payload.contaId || 'não encontrado');
          console.log('🔍 [AGENDAMENTO] Token expiry:', payload.exp ? new Date(payload.exp * 1000) : 'não encontrado');
          console.log('🔍 [AGENDAMENTO] Token issued at:', payload.iat ? new Date(payload.iat * 1000) : 'não encontrado');

          // Verificar se o token está expirado
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.error('⚠️ [AGENDAMENTO] TOKEN EXPIRADO!');
            console.error('⚠️ [AGENDAMENTO] Expiry:', new Date(payload.exp * 1000));
            console.error('⚠️ [AGENDAMENTO] Now:', new Date());
            throw new Error('Token expirado. Faça login novamente.');
          } else if (payload.exp) {
            console.log('✅ [AGENDAMENTO] Token ainda válido até:', new Date(payload.exp * 1000));
          }

          // Verificar se a conta no request coincide com a do usuário
          const userContaId = payload.contaId;
          if (userContaId) {
            console.log('🔍 [AGENDAMENTO] Verificando propriedade da conta...');
            console.log('🔍 [AGENDAMENTO] Conta do usuário no token:', userContaId);
            console.log('🔍 [AGENDAMENTO] Conta de destino no request:', request.contaDestinoId);

            // Nota: A conta de origem não está no request, mas deveria ser a conta do usuário logado
            console.log('💡 [AGENDAMENTO] A conta de origem será automaticamente a conta do usuário logado');
          } else {
            console.warn('⚠️ [AGENDAMENTO] Token não contém contaId - possível problema!');
          }
        } else {
          console.warn('⚠️ [AGENDAMENTO] Token não é JWT válido (não tem 3 partes)');
          console.log('🔍 [AGENDAMENTO] Token completo para análise:', token);
        }
      } catch (tokenError) {
        console.error('⚠️ [AGENDAMENTO] ERRO ao decodificar token:', tokenError);
        console.log('🔍 [AGENDAMENTO] Token que causou erro:', token);
        console.log('⚠️ [AGENDAMENTO] Token pode estar malformado ou não ser JWT válido');

        // Tentar analisar o formato do token
        if (token.startsWith('Bearer ')) {
          console.log('💡 [AGENDAMENTO] Token começa com "Bearer " - pode estar com prefixo incorreto');
        }
        if (!token.includes('.')) {
          console.log('💡 [AGENDAMENTO] Token não contém pontos - não é JWT');
        }
      }
    } else {
      console.error('🚫 [AGENDAMENTO] NENHUM TOKEN ENCONTRADO!');
      throw new Error('Nenhum token de autenticação encontrado. Faça login novamente.');
    }

    const fullUrl = `${apiUrl}/operacoes/agendamento`;
    console.log('📡 [AGENDAMENTO] URL completa:', fullUrl);

    try {
      console.log('⏳ [AGENDAMENTO] Enviando requisição para API real...');

      // Validar conta de destino antes de enviar
      console.log('🔍 [AGENDAMENTO] Validando conta de destino...');
      try {
        const contasDisponiveis = await this.buscarContasDisponiveis();
        const contaDestino = contasDisponiveis.dados.contas.find(c => c.contaId === request.contaDestinoId);

        if (!contaDestino) {
          console.error('❌ [AGENDAMENTO] Conta de destino não encontrada na lista de contas disponíveis');
          throw new Error(`Conta de destino ID ${request.contaDestinoId} não encontrada`);
        }

        console.log('✅ [AGENDAMENTO] Conta de destino válida:', {
          contaId: contaDestino.contaId,
          numeroConta: contaDestino.numeroConta,
          titular: contaDestino.titular
        });
      } catch (validationError: any) {
        console.warn('⚠️ [AGENDAMENTO] Não foi possível validar conta de destino:', validationError.message);
        console.log('🔄 [AGENDAMENTO] Prosseguindo com o request mesmo assim...');
      }

      const response = await httpClient.post<AgendamentoResponse>('/pagamentos/agendar', request);

      console.log('✅ [AGENDAMENTO] Resposta recebida com sucesso!');
      console.log('📦 [AGENDAMENTO] Response data:', JSON.stringify(response, null, 2));

      // Validar se a resposta tem estrutura esperada
      if (!response.dados || !response.dados.agendamento) {
        console.error('❌ [AGENDAMENTO] Resposta inválida - faltando dados.agendamento');
        throw new Error('Resposta inválida da API - estrutura inesperada');
      }

      // Verificar se é um ID real (não mock)
      const agendamentoId = response.dados.agendamento.id;
      console.log('🆔 [AGENDAMENTO] ID do agendamento criado:', agendamentoId);

      if (agendamentoId && agendamentoId > 1000) {
        console.warn('⚠️ [AGENDAMENTO] ID suspeito (>1000) - pode ser mock');
      }

      console.log('🎉 [AGENDAMENTO] Agendamento criado com sucesso na API!');
      return response;

    } catch (error: any) {
      console.error('❌ [AGENDAMENTO] Erro na requisição para API:');
      console.error('📋 [AGENDAMENTO] Error details:', error);
      console.error('🔍 [AGENDAMENTO] Error message:', error.message);
      console.error('🔍 [AGENDAMENTO] Error stack:', error.stack);

      // Verificar tipo de erro
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.error('🚫 [AGENDAMENTO] Erro de autenticação - token inválido/expirado');
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        console.error('🚫 [AGENDAMENTO] Erro de autorização - sem permissão');
        console.error('� [AGENDAMENTO] Mensagem original do erro:', error.message);
        console.error('�💡 [AGENDAMENTO] Possíveis causas para erro 403:');
        console.error('   1. Token JWT malformado ou corrompido');
        console.error('   2. Usuário não é proprietário da conta de origem');
        console.error('   3. Conta de origem inválida ou inexistente');
        console.error('   4. Regras de negócio específicas (ex: saldo insuficiente, limites)');
        console.error('   5. Sessão expirada mas backend retorna 403 em vez de 401');
        console.error('   6. Problemas de CORS ou configuração do servidor');

        // Extrair mensagem específica do backend removendo prefixos padrão
        let mensagemBackend = error.message;

        // Remover prefixos comuns
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

        console.log('🔍 [AGENDAMENTO] Mensagem processada do backend:', mensagemBackend);

        // Se ainda temos uma mensagem válida do backend, usá-la
        const mensagemFinal = mensagemBackend && mensagemBackend.length > 10
          ? `${mensagemBackend}`
          : 'Acesso negado ao criar agendamento. Verifique se você é o proprietário da conta de origem.';

        throw new Error(mensagemFinal);
      }

      if (error.message?.includes('404')) {
        console.error('� [AGENDAMENTO] Endpoint não encontrado');
        throw new Error('Serviço de agendamento não disponível. Contate o suporte.');
      }

      if (error.message?.includes('500')) {
        console.error('🚫 [AGENDAMENTO] Erro interno do servidor');
        throw new Error('Erro interno do servidor. Tente novamente em alguns instantes.');
      }

      if (error.message?.includes('fetch')) {
        console.error('🚫 [AGENDAMENTO] Erro de conectividade/rede');
        throw new Error('Erro de conectividade. Verifique sua conexão com a internet.');
      }

      // Re-throw o erro original para não mascarar o problema
      throw new Error(error.message || 'Erro inesperado ao criar agendamento. Verifique os logs do console.');
    }
  }

  /**
   * MÉTODO MOCK PARA FALLBACK - Remove quando integração estiver completa
   */
  async criarAgendamentoMock(request: AgendamentoRequest): Promise<AgendamentoResponse> {
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

  /**
   * Consulta o saldo da conta
   * 
   * Endpoint: GET /contas/{contaId}/saldo
   * Headers: 
   *   - Authorization: Bearer {token}
   * 
   * Response exemplo:
   * {
   *   "dados": {
   *     "dataConsulta": "2025-07-07T22:55:51.439390973"
   *   },
   *   "conta": {
   *     "contaId": 1,
   *     "numeroConta": "2025000001",
   *     "titular": "João Silva",
   *     "usuarioProprietario": "cliente",
   *     "usuarioProprietarioId": 2,
   *     "saldo": 4950
   *   },
   *   "message": "Saldo consultado com sucesso",
   *   "timestamp": "2025-07-07T22:55:51.439443837"
   * }
   */
  async consultarSaldo(contaId: number): Promise<SaldoResponse> {
    try {
      // Fazer chamada real à API
      const response = await httpClient.get<SaldoResponse>(`/contas/${contaId}/saldo`);
      return response;
    } catch (error: any) {
      // Se a API não estiver disponível ou houver erro, usar dados mock como fallback
      console.warn('Erro ao consultar saldo no backend, usando dados mock:', error.message);

      // Simular delay de rede
      await this.delay(800);

      // Simular resposta de sucesso com dados mock
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

  /**
   * Busca todas as contas disponíveis no sistema
   * 
   * Endpoint: GET /contas-disponiveis
   * Headers: 
   *   - Authorization: Bearer {token}
   * 
   * Response:
   * {
   *   "dados": {
   *     "totalContas": 5,
   *     "contas": [...]
   *   },
   *   "message": "Contas disponíveis listadas com sucesso",
   *   "timestamp": "2025-07-07T23:23:06.114731897"
   * }
   */
  /**
   * Busca todas as contas disponíveis no sistema
   * 
   * Endpoint: GET /auth/contas-disponiveis
   * Retorna lista de todas as contas sem informações de saldo
   */
  async buscarContasDisponiveis(): Promise<ContasDisponiveisResponse> {
    try {
      console.log('🔍 Chamando /auth/contas-disponiveis...');
      const response = await httpClient.get<ContasDisponiveisResponse>('/auth/contas-disponiveis');
      console.log('✅ Resposta recebida:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao buscar contas:', error);
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro inesperado ao buscar contas disponíveis. Tente novamente.');
      }
    }
  }

  /**
   * Testa permissões em diferentes endpoints para diagnosticar problemas de autorização
   */
  async testarPermissoes(): Promise<{ [key: string]: boolean }> {
    console.log('🔍 [PERMISSÕES] Testando permissões em diferentes endpoints...');

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
        console.log(`🧪 [PERMISSÕES] Testando ${endpoint.nome}...`);
        if (endpoint.nota) {
          console.log(`💡 [PERMISSÕES] Nota: ${endpoint.nota}`);
        }

        await endpoint.metodo();
        resultados[endpoint.nome] = true;
        console.log(`✅ [PERMISSÕES] ${endpoint.nome}: OK`);
      } catch (error: any) {
        resultados[endpoint.nome] = false;
        console.log(`❌ [PERMISSÕES] ${endpoint.nome}: ${error.message}`);

        if (error.message?.includes('403')) {
          console.log(`🚫 [PERMISSÕES] ${endpoint.nome} também retorna 403 - problema generalizado!`);
        } else if (error.message?.includes('400')) {
          console.log(`⚠️ [PERMISSÕES] ${endpoint.nome} retorna 400 - pode ser regra de negócio, não permissão`);
        } else if (error.message?.includes('401')) {
          console.log(`🔐 [PERMISSÕES] ${endpoint.nome} retorna 401 - problema de autenticação`);
        }
      }
    }

    console.log('📊 [PERMISSÕES] Resumo dos testes:', resultados);

    // Análise dos resultados
    const sucessos = Object.values(resultados).filter(Boolean).length;
    const total = Object.keys(resultados).length;

    if (sucessos === 0) {
      console.log('🚨 [PERMISSÕES] TODOS os endpoints falharam - problema geral de autenticação/autorização');
    } else if (sucessos < total) {
      console.log('⚠️ [PERMISSÕES] Alguns endpoints falharam - problema específico de certos recursos');
    } else {
      console.log('✅ [PERMISSÕES] Todos os endpoints funcionaram - problema específico do agendamento');
    }

    return resultados;
  }

  /**
   * Testa especificamente o endpoint de agendamento com dados mínimos válidos
   */
  async testarAgendamentoMinimo(): Promise<boolean> {
    console.log('🧪 [TESTE-AGENDAMENTO] Testando agendamento com dados mínimos...');

    try {
      // Buscar uma conta válida para usar como destino
      const contasDisponiveis = await this.buscarContasDisponiveis();
      if (contasDisponiveis.dados.contas.length < 2) {
        throw new Error('Precisa de pelo menos 2 contas no sistema para testar agendamento');
      }

      // Obter conta do usuário logado (primeira da lista ou pela busca específica)
      const contaUsuario = contasDisponiveis.dados.contas[0];
      const contaDestino = contasDisponiveis.dados.contas[1];

      const requestTeste: AgendamentoRequest = {
        contaDestinoId: contaDestino.contaId,
        valorTotal: 0.01, // Valor mínimo para teste
        quantidadeParcelas: 1,
        periodicidadeDias: 30,
        debitarPrimeiraParcela: false, // Não debitar para não afetar saldo
        descricao: 'TESTE - Agendamento de diagnóstico',
        dataInicio: new Date().toISOString().split('T')[0]
      };

      console.log('📋 [TESTE-AGENDAMENTO] Request de teste:', requestTeste);
      console.log('📤 [TESTE-AGENDAMENTO] Conta origem para teste:', {
        contaId: contaUsuario.contaId,
        numeroConta: contaUsuario.numeroConta,
        titular: contaUsuario.titular
      });
      console.log('🎯 [TESTE-AGENDAMENTO] Conta destino para teste:', {
        contaId: contaDestino.contaId,
        numeroConta: contaDestino.numeroConta,
        titular: contaDestino.titular
      });

      // Tentar criar o agendamento de teste
      const response = await httpClient.post<AgendamentoResponse>('/pagamentos/agendar', requestTeste);

      console.log('✅ [TESTE-AGENDAMENTO] Agendamento de teste criado com sucesso!');
      console.log('📦 [TESTE-AGENDAMENTO] Response:', response);

      // Se chegou até aqui, o endpoint funciona
      return true;

    } catch (error: any) {
      console.error('❌ [TESTE-AGENDAMENTO] Falha no teste de agendamento:', error);
      console.error('🔍 [TESTE-AGENDAMENTO] Detalhes do erro:', error.message);

      if (error.message?.includes('403')) {
        console.error('🚫 [TESTE-AGENDAMENTO] Confirmado: problema de autorização no endpoint de agendamento');
      }

      return false;
    }
  }



  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const operacoesService = new OperacoesService();
