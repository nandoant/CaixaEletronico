package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.*;
import br.com.caixaeletronico.util.TestDataBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service Integration Tests")
@Transactional
class ServiceIntegrationTest {

    @Mock
    private ContaRepository contaRepository;
    
    @Mock
    private OperacaoRepository operacaoRepository;
    
    @Mock
    private EstoqueGlobalRepository estoqueGlobalRepository;
    
    @Mock
    private PagamentoAgendadoRepository pagamentoAgendadoRepository;

    @InjectMocks
    private AccountService accountService;
    
    @InjectMocks
    private ExtractService extractService;
    
    @InjectMocks
    private EstoqueGlobalService estoqueGlobalService;
    
    @InjectMocks
    private PaymentScheduleService paymentScheduleService;

    @Test
    @DisplayName("Deve executar operação completa de depósito com atualização de estoque")
    void deveExecutarOperacaoCompletaDeDepositoComAtualizacaoDeEstoque() {
        // Given
        Long contaId = 1L;
        BigDecimal valorDeposito = new BigDecimal("500.00");
        BigDecimal saldoAtual = new BigDecimal("100.00");
        
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoAtual)
                .build();

        // Estoque de cédulas para o depósito
        EstoqueGlobal estoqueCem = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(ValorCedula.CEM)
                .comQuantidade(10)
                .build();

        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        when(contaRepository.save(any(Conta.class))).thenReturn(conta);
        when(estoqueGlobalRepository.findByValorCedula(ValorCedula.CEM))
                .thenReturn(Optional.of(estoqueCem));
        when(estoqueGlobalRepository.save(any(EstoqueGlobal.class)))
                .thenReturn(estoqueCem);

        // When
        // 1. Credita o valor na conta
        accountService.creditarConta(contaId, valorDeposito);
        
        // 2. Adiciona cédulas ao estoque (simulando depósito físico)
        estoqueGlobalService.adicionarCedulas(ValorCedula.CEM, 5); // 5 notas de R$ 100

        // Then
        verify(contaRepository).findById(contaId);
        verify(contaRepository).save(argThat(c -> 
            c.getSaldo().equals(new BigDecimal("600.00"))));
        
        verify(estoqueGlobalRepository).findByValorCedula(ValorCedula.CEM);
        verify(estoqueGlobalRepository).save(argThat(e -> 
            e.getQuantidade().equals(15))); // 10 + 5
    }

    @Test
    @DisplayName("Deve executar operação completa de saque com validação de estoque")
    void deveExecutarOperacaoCompletaDeSaqueComValidacaoDeEstoque() {
        // Given
        Long contaId = 1L;
        BigDecimal valorSaque = new BigDecimal("300.00");
        BigDecimal saldoAtual = new BigDecimal("500.00");
        
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoAtual)
                .build();

        EstoqueGlobal estoqueCem = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(ValorCedula.CEM)
                .comQuantidade(10)
                .build();

        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        when(contaRepository.save(any(Conta.class))).thenReturn(conta);
        when(estoqueGlobalRepository.findByValorCedula(ValorCedula.CEM))
                .thenReturn(Optional.of(estoqueCem));
        when(estoqueGlobalRepository.save(any(EstoqueGlobal.class)))
                .thenReturn(estoqueCem);

        // When
        // 1. Verifica disponibilidade no estoque
        boolean estoqueDisponivel = estoqueGlobalService.verificarDisponibilidade(ValorCedula.CEM, 3);
        
        if (estoqueDisponivel) {
            // 2. Debita da conta
            accountService.debitarConta(contaId, valorSaque);
            // 3. Remove cédulas do estoque
            estoqueGlobalService.removerCedulas(ValorCedula.CEM, 3);
        }

        // Then
        assertThat(estoqueDisponivel).isTrue();
        
        verify(contaRepository).findById(contaId);
        verify(contaRepository).save(argThat(c -> 
            c.getSaldo().equals(new BigDecimal("200.00"))));
        
        verify(estoqueGlobalRepository, times(2)).findByValorCedula(ValorCedula.CEM);
        verify(estoqueGlobalRepository).save(argThat(e -> 
            e.getQuantidade().equals(7))); // 10 - 3
    }

    @Test
    @DisplayName("Deve impedir saque quando estoque insuficiente")
    void deveImpedirSaqueQuandoEstoqueInsuficiente() {
        // Given
        EstoqueGlobal estoqueInsuficiente = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(ValorCedula.CEM)
                .comQuantidade(2) // Apenas 2 notas de R$ 100 = R$ 200
                .build();

        when(estoqueGlobalRepository.findByValorCedula(ValorCedula.CEM))
                .thenReturn(Optional.of(estoqueInsuficiente));

        // When
        boolean estoqueDisponivel = estoqueGlobalService.verificarDisponibilidade(ValorCedula.CEM, 10); // Precisa de 10 notas

        // Then
        assertThat(estoqueDisponivel).isFalse();
        
        // Verifica que não houve tentativa de debitar conta ou remover estoque
        verify(contaRepository, never()).findById(any());
        verify(contaRepository, never()).save(any());
        verify(estoqueGlobalRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve processar transferência entre contas")
    void deveProcessarTransferenciaEntreContas() {
        // Given
        Long contaOrigemId = 1L;
        Long contaDestinoId = 2L;
        BigDecimal valorTransferencia = new BigDecimal("250.00");
        
        Conta contaOrigem = TestDataBuilder.umaConta()
                .comId(contaOrigemId)
                .comSaldo(new BigDecimal("500.00"))
                .build();
        
        Conta contaDestino = TestDataBuilder.umaConta()
                .comId(contaDestinoId)
                .comSaldo(new BigDecimal("100.00"))
                .build();

        when(contaRepository.findById(contaOrigemId)).thenReturn(Optional.of(contaOrigem));
        when(contaRepository.findById(contaDestinoId)).thenReturn(Optional.of(contaDestino));
        when(contaRepository.save(any(Conta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        // 1. Verifica saldo da conta origem
        boolean saldoSuficiente = accountService.verificarSaldoSuficiente(contaOrigemId, valorTransferencia);
        
        if (saldoSuficiente) {
            // 2. Debita da conta origem
            accountService.debitarConta(contaOrigemId, valorTransferencia);
            // 3. Credita na conta destino
            accountService.creditarConta(contaDestinoId, valorTransferencia);
        }

        // Then
        assertThat(saldoSuficiente).isTrue();
        
        verify(contaRepository, times(3)).findById(contaOrigemId); // Verificação + débito
        verify(contaRepository, times(1)).findById(contaDestinoId); // Crédito
        verify(contaRepository, times(2)).save(any(Conta.class)); // Salva origem e destino
    }

    @Test
    @DisplayName("Deve criar e processar pagamento agendado com débito automático")
    void deveCriarEProcessarPagamentoAgendadoComDebitoAutomatico() {
        // Given
        Conta conta = TestDataBuilder.umaConta()
                .comSaldo(new BigDecimal("1000.00"))
                .build();
        
        BigDecimal valorTotal = new BigDecimal("300.00");
        Integer quantidadeParcelas = 3;
        Integer periodicidadeDias = 30;
        
        PagamentoAgendado pagamento = TestDataBuilder.umPagamentoAgendado()
                .comContaOrigem(conta)
                .comContaDestino(conta)
                .comValorTotal(valorTotal)
                .comQuantidadeParcelas(quantidadeParcelas)
                .build();

        when(pagamentoAgendadoRepository.save(any(PagamentoAgendado.class)))
                .thenReturn(pagamento);
        when(contaRepository.save(any(Conta.class)))
                .thenReturn(conta);

        // When
        paymentScheduleService.criarPagamentoAgendado(
                conta, valorTotal, quantidadeParcelas, periodicidadeDias, 
                java.time.LocalDate.now(), true);

        // Then
        verify(pagamentoAgendadoRepository).save(any(PagamentoAgendado.class));
        
        // Verifica que primeira parcela foi debitada
        BigDecimal valorParcela = valorTotal.divide(new BigDecimal(quantidadeParcelas), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal saldoEsperado = new BigDecimal("1000.00").subtract(valorParcela);
        
        assertThat(conta.getSaldo()).isEqualTo(saldoEsperado);
    }

    @Test
    @DisplayName("Deve gerar operações consistentes no extrato")
    void deveGerarOperacoesConsistentesNoExtrato() {
        // Given
        Conta conta = TestDataBuilder.umaConta().build();
        
        // Simula operações já existentes
        java.util.List<Operacao> operacoesExistentes = java.util.Arrays.asList(
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comValor(new BigDecimal("500.00"))
                        .comDataHora(LocalDateTime.now().minusDays(2))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.SAQUE)
                        .comValor(new BigDecimal("100.00"))
                        .comDataHora(LocalDateTime.now().minusDays(1))
                        .build()
        );

        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(operacoesExistentes);

        // When
        java.util.List<Operacao> extrato = extractService.obterExtrato(conta);
        java.util.List<Operacao> ultimasOperacoes = extractService.obterUltimasOperacoes(conta, 1);

        // Then
        assertThat(extrato).hasSize(2);
        assertThat(ultimasOperacoes).hasSize(1);
        assertThat(ultimasOperacoes.get(0).getTipo()).isEqualTo(TipoOperacao.DEPOSITO); // Mais recente
        
        verify(operacaoRepository, times(2)).findByContaOrderByDataHoraDesc(conta);
    }
}
