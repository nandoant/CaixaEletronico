package br.com.caixaeletronico.service;
import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.PagamentoAgendadoRepository;
import br.com.caixaeletronico.util.TestDataBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentScheduleService Tests")
class PaymentScheduleServiceTest {
    @Mock
    private PagamentoAgendadoRepository pagamentoAgendadoRepository;
    @Mock
    private ContaRepository contaRepository;
    @InjectMocks
    private PaymentScheduleService paymentScheduleService;
    @Test
    @DisplayName("Deve criar pagamento agendado sem debitar primeira parcela")
    void deveCriarPagamentoAgendadoSemDebitarPrimeiraParcela() {
        Conta conta = TestDataBuilder.umaConta()
                .comSaldo(new BigDecimal("500.00"))
                .build();
        BigDecimal valorTotal = new BigDecimal("300.00");
        Integer quantidadeParcelas = 3;
        Integer periodicidadeDias = 30;
        LocalDate dataInicio = LocalDate.now().plusDays(30);
        boolean debitarPrimeiraParcela = false;
        PagamentoAgendado pagamentoEsperado = TestDataBuilder.umPagamentoAgendado()
                .comContaOrigem(conta)
                .comContaDestino(conta)
                .comValorTotal(valorTotal)
                .comQuantidadeParcelas(quantidadeParcelas)
                .build();
        when(pagamentoAgendadoRepository.save(any(PagamentoAgendado.class)))
                .thenReturn(pagamentoEsperado);
        PagamentoAgendado resultado = paymentScheduleService.criarPagamentoAgendado(
                conta, valorTotal, quantidadeParcelas, periodicidadeDias, dataInicio, debitarPrimeiraParcela);
        assertThat(resultado).isNotNull();
        verify(pagamentoAgendadoRepository).save(any(PagamentoAgendado.class));
        verify(contaRepository, never()).save(any(Conta.class));
    }
    @Test
    @DisplayName("Deve criar pagamento agendado e debitar primeira parcela")
    void deveCriarPagamentoAgendadoEDebitarPrimeiraParcela() {
        BigDecimal saldoInicial = new BigDecimal("500.00");
        Conta conta = TestDataBuilder.umaConta()
                .comSaldo(saldoInicial)
                .build();
        BigDecimal valorTotal = new BigDecimal("300.00");
        Integer quantidadeParcelas = 3;
        Integer periodicidadeDias = 30;
        LocalDate dataInicio = LocalDate.now();
        boolean debitarPrimeiraParcela = true;
        PagamentoAgendado pagamentoEsperado = TestDataBuilder.umPagamentoAgendado()
                .comContaOrigem(conta)
                .comContaDestino(conta)
                .comValorTotal(valorTotal)
                .comQuantidadeParcelas(quantidadeParcelas)
                .build();
        when(pagamentoAgendadoRepository.save(any(PagamentoAgendado.class)))
                .thenReturn(pagamentoEsperado);
        PagamentoAgendado resultado = paymentScheduleService.criarPagamentoAgendado(
                conta, valorTotal, quantidadeParcelas, periodicidadeDias, dataInicio, debitarPrimeiraParcela);
        assertThat(resultado).isNotNull();
        BigDecimal valorParcela = valorTotal.divide(new BigDecimal(quantidadeParcelas));
        BigDecimal saldoEsperado = saldoInicial.subtract(valorParcela);
        assertThat(conta.getSaldo()).isEqualTo(saldoEsperado);
        verify(pagamentoAgendadoRepository).save(any(PagamentoAgendado.class));
    }
    @Test
    @DisplayName("Deve lançar exceção quando saldo insuficiente para primeira parcela")
    void deveLancarExcecaoQuandoSaldoInsuficienteParaPrimeiraParcela() {
        Conta conta = TestDataBuilder.umaConta()
                .comSaldo(new BigDecimal("50.00"))
                .build();
        BigDecimal valorTotal = new BigDecimal("300.00");
        Integer quantidadeParcelas = 3;
        Integer periodicidadeDias = 30;
        LocalDate dataInicio = LocalDate.now();
        boolean debitarPrimeiraParcela = true;
        assertThatThrownBy(() -> paymentScheduleService.criarPagamentoAgendado(
                conta, valorTotal, quantidadeParcelas, periodicidadeDias, dataInicio, debitarPrimeiraParcela))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Saldo insuficiente para primeira parcela");
        verify(pagamentoAgendadoRepository, never()).save(any());
    }
    @Test
    @DisplayName("Deve finalizar pagamento quando só tem uma parcela")
    void deveFinalizarPagamentoQuandoSoTemUmaParcela() {
        Conta conta = TestDataBuilder.umaConta()
                .comSaldo(new BigDecimal("200.00"))
                .build();
        BigDecimal valorTotal = new BigDecimal("100.00");
        Integer quantidadeParcelas = 1;
        Integer periodicidadeDias = 30;
        LocalDate dataInicio = LocalDate.now();
        boolean debitarPrimeiraParcela = true;
        PagamentoAgendado pagamentoEsperado = TestDataBuilder.umPagamentoAgendado()
                .comContaOrigem(conta)
                .comContaDestino(conta)
                .comValorTotal(valorTotal)
                .comQuantidadeParcelas(quantidadeParcelas)
                .comStatus(StatusAgendamento.CONCLUIDO)
                .build();
        when(pagamentoAgendadoRepository.save(any(PagamentoAgendado.class)))
                .thenReturn(pagamentoEsperado);
        PagamentoAgendado resultado = paymentScheduleService.criarPagamentoAgendado(
                conta, valorTotal, quantidadeParcelas, periodicidadeDias, dataInicio, debitarPrimeiraParcela);
        assertThat(resultado).isNotNull();
        assertThat(conta.getSaldo()).isEqualTo(new BigDecimal("100.00"));
        ArgumentCaptor<PagamentoAgendado> pagamentoCaptor = ArgumentCaptor.forClass(PagamentoAgendado.class);
        verify(pagamentoAgendadoRepository).save(pagamentoCaptor.capture());
        PagamentoAgendado pagamentoSalvo = pagamentoCaptor.getValue();
        assertThat(pagamentoSalvo.getParcelasRestantes()).isEqualTo(0);
    }
    @Test
    @DisplayName("Deve cancelar pagamento agendado")
    void deveCancelarPagamentoAgendado() {
        Long pagamentoId = 1L;
        PagamentoAgendado pagamento = TestDataBuilder.umPagamentoAgendado()
                .comId(pagamentoId)
                .comStatus(StatusAgendamento.ATIVO)
                .build();
        when(pagamentoAgendadoRepository.findById(pagamentoId))
                .thenReturn(Optional.of(pagamento));
        paymentScheduleService.cancelarPagamento(pagamentoId);
        ArgumentCaptor<PagamentoAgendado> pagamentoCaptor = ArgumentCaptor.forClass(PagamentoAgendado.class);
        verify(pagamentoAgendadoRepository).save(pagamentoCaptor.capture());
        PagamentoAgendado pagamentoCancelado = pagamentoCaptor.getValue();
        assertThat(pagamentoCancelado.getStatus()).isEqualTo(StatusAgendamento.CANCELADO);
    }
    @Test
    @DisplayName("Deve lançar exceção ao tentar cancelar pagamento não encontrado")
    void deveLancarExcecaoAoTentarCancelarPagamentoNaoEncontrado() {
        Long pagamentoId = 999L;
        when(pagamentoAgendadoRepository.findById(pagamentoId))
                .thenReturn(Optional.empty());
        assertThatThrownBy(() -> paymentScheduleService.cancelarPagamento(pagamentoId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Pagamento agendado não encontrado");
        verify(pagamentoAgendadoRepository).findById(pagamentoId);
        verify(pagamentoAgendadoRepository, never()).save(any());
    }
}
