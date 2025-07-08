package br.com.caixaeletronico.service;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.repository.OperacaoRepository;
import br.com.caixaeletronico.util.TestDataBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
@DisplayName("ExtractService Tests")
class ExtractServiceTest {
    @Mock
    private OperacaoRepository operacaoRepository;
    @InjectMocks
    private ExtractService extractService;
    @Test
    @DisplayName("Deve obter extrato completo da conta")
    void deveObterExtratoCompletoDaConta() {
        Conta conta = TestDataBuilder.umaConta().build();
        List<Operacao> operacoesEsperadas = Arrays.asList(
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comValor(new BigDecimal("100.00"))
                        .comDataHora(LocalDateTime.now().minusDays(1))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.SAQUE)
                        .comValor(new BigDecimal("50.00"))
                        .comDataHora(LocalDateTime.now().minusDays(2))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.TRANSFERENCIA)
                        .comValor(new BigDecimal("200.00"))
                        .comDataHora(LocalDateTime.now().minusDays(3))
                        .build()
        );
        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(operacoesEsperadas);
        List<Operacao> resultado = extractService.obterExtrato(conta);
        assertThat(resultado).hasSize(3);
        assertThat(resultado).isEqualTo(operacoesEsperadas);
        verify(operacaoRepository).findByContaOrderByDataHoraDesc(conta);
    }
    @Test
    @DisplayName("Deve retornar lista vazia quando conta não tem operações")
    void deveRetornarListaVaziaQuandoContaNaoTemOperacoes() {
        Conta conta = TestDataBuilder.umaConta().build();
        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(Arrays.asList());
        List<Operacao> resultado = extractService.obterExtrato(conta);
        assertThat(resultado).isEmpty();
        verify(operacaoRepository).findByContaOrderByDataHoraDesc(conta);
    }
    @Test
    @DisplayName("Deve obter extrato por período específico")
    void deveObterExtratoPorPeriodoEspecifico() {
        Conta conta = TestDataBuilder.umaConta().build();
        LocalDateTime dataInicio = LocalDateTime.now().minusDays(7);
        LocalDateTime dataFim = LocalDateTime.now();
        List<Operacao> operacoesPeriodo = Arrays.asList(
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comValor(new BigDecimal("300.00"))
                        .comDataHora(LocalDateTime.now().minusDays(3))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.SAQUE)
                        .comValor(new BigDecimal("150.00"))
                        .comDataHora(LocalDateTime.now().minusDays(5))
                        .build()
        );
        when(operacaoRepository.findByContaAndDataHoraBetweenOrderByDataHoraDesc(conta, dataInicio, dataFim))
                .thenReturn(operacoesPeriodo);
        List<Operacao> resultado = extractService.obterExtratoPorPeriodo(conta, dataInicio, dataFim);
        assertThat(resultado).hasSize(2);
        assertThat(resultado).isEqualTo(operacoesPeriodo);
        verify(operacaoRepository).findByContaAndDataHoraBetweenOrderByDataHoraDesc(conta, dataInicio, dataFim);
    }
    @Test
    @DisplayName("Deve retornar lista vazia para período sem operações")
    void deveRetornarListaVaziaParaPeriodoSemOperacoes() {
        Conta conta = TestDataBuilder.umaConta().build();
        LocalDateTime dataInicio = LocalDateTime.now().minusDays(30);
        LocalDateTime dataFim = LocalDateTime.now().minusDays(25);
        when(operacaoRepository.findByContaAndDataHoraBetweenOrderByDataHoraDesc(conta, dataInicio, dataFim))
                .thenReturn(Arrays.asList());
        List<Operacao> resultado = extractService.obterExtratoPorPeriodo(conta, dataInicio, dataFim);
        assertThat(resultado).isEmpty();
        verify(operacaoRepository).findByContaAndDataHoraBetweenOrderByDataHoraDesc(conta, dataInicio, dataFim);
    }
    @Test
    @DisplayName("Deve obter últimas operações com limite menor que total")
    void deveObterUltimasOperacoesComLimiteMenorQueTotal() {
        Conta conta = TestDataBuilder.umaConta().build();
        int limite = 2;
        List<Operacao> todasOperacoes = Arrays.asList(
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comValor(new BigDecimal("100.00"))
                        .comDataHora(LocalDateTime.now())
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.SAQUE)
                        .comValor(new BigDecimal("50.00"))
                        .comDataHora(LocalDateTime.now().minusHours(1))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.TRANSFERENCIA)
                        .comValor(new BigDecimal("200.00"))
                        .comDataHora(LocalDateTime.now().minusHours(2))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comValor(new BigDecimal("75.00"))
                        .comDataHora(LocalDateTime.now().minusHours(3))
                        .build()
        );
        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(todasOperacoes);
        List<Operacao> resultado = extractService.obterUltimasOperacoes(conta, limite);
        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0)).isEqualTo(todasOperacoes.get(0));
        assertThat(resultado.get(1)).isEqualTo(todasOperacoes.get(1));
        verify(operacaoRepository).findByContaOrderByDataHoraDesc(conta);
    }
    @Test
    @DisplayName("Deve retornar todas as operações quando limite é maior que total")
    void deveRetornarTodasAsOperacoesQuandoLimiteEMaiorQueTotal() {
        Conta conta = TestDataBuilder.umaConta().build();
        int limite = 5;
        List<Operacao> todasOperacoes = Arrays.asList(
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comValor(new BigDecimal("100.00"))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.SAQUE)
                        .comValor(new BigDecimal("50.00"))
                        .build()
        );
        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(todasOperacoes);
        List<Operacao> resultado = extractService.obterUltimasOperacoes(conta, limite);
        assertThat(resultado).hasSize(2);
        assertThat(resultado).isEqualTo(todasOperacoes);
        verify(operacaoRepository).findByContaOrderByDataHoraDesc(conta);
    }
    @Test
    @DisplayName("Deve retornar todas as operações quando limite é igual ao total")
    void deveRetornarTodasAsOperacoesQuandoLimiteEIgualAoTotal() {
        Conta conta = TestDataBuilder.umaConta().build();
        int limite = 3;
        List<Operacao> todasOperacoes = Arrays.asList(
                TestDataBuilder.umaOperacao().comTipo(TipoOperacao.DEPOSITO).build(),
                TestDataBuilder.umaOperacao().comTipo(TipoOperacao.SAQUE).build(),
                TestDataBuilder.umaOperacao().comTipo(TipoOperacao.TRANSFERENCIA).build()
        );
        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(todasOperacoes);
        List<Operacao> resultado = extractService.obterUltimasOperacoes(conta, limite);
        assertThat(resultado).hasSize(3);
        assertThat(resultado).isEqualTo(todasOperacoes);
        verify(operacaoRepository).findByContaOrderByDataHoraDesc(conta);
    }
    @Test
    @DisplayName("Deve retornar lista vazia quando não há operações e limite é aplicado")
    void deveRetornarListaVaziaQuandoNaoHaOperacoesELimiteEAplicado() {
        Conta conta = TestDataBuilder.umaConta().build();
        int limite = 5;
        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(Arrays.asList());
        List<Operacao> resultado = extractService.obterUltimasOperacoes(conta, limite);
        assertThat(resultado).isEmpty();
        verify(operacaoRepository).findByContaOrderByDataHoraDesc(conta);
    }
    @Test
    @DisplayName("Deve obter uma única operação quando limite é 1")
    void deveObterUmaUnicaOperacaoQuandoLimiteE1() {
        Conta conta = TestDataBuilder.umaConta().build();
        int limite = 1;
        List<Operacao> todasOperacoes = Arrays.asList(
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comValor(new BigDecimal("500.00"))
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.SAQUE)
                        .comValor(new BigDecimal("100.00"))
                        .build()
        );
        when(operacaoRepository.findByContaOrderByDataHoraDesc(conta))
                .thenReturn(todasOperacoes);
        List<Operacao> resultado = extractService.obterUltimasOperacoes(conta, limite);
        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0)).isEqualTo(todasOperacoes.get(0));
        assertThat(resultado.get(0).getTipo()).isEqualTo(TipoOperacao.DEPOSITO);
        verify(operacaoRepository).findByContaOrderByDataHoraDesc(conta);
    }
}
