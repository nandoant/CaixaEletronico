package br.com.caixaeletronico.service;
import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.EstoqueGlobalRepository;
import br.com.caixaeletronico.util.TestDataBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountService Tests")
class AccountServiceTest {
    @Mock
    private ContaRepository contaRepository;
    @Mock
    private EstoqueGlobalRepository estoqueGlobalRepository;
    @InjectMocks
    private AccountService accountService;
    @Test
    @DisplayName("Deve creditar valor na conta com sucesso")
    void deveCreditarValorNaContaComSucesso() {
        Long contaId = 1L;
        BigDecimal valorCredito = new BigDecimal("100.00");
        BigDecimal saldoAtual = new BigDecimal("50.00");
        BigDecimal saldoEsperado = new BigDecimal("150.00");
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoAtual)
                .build();
        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        when(contaRepository.save(any(Conta.class))).thenReturn(conta);
        accountService.creditarConta(contaId, valorCredito);
        ArgumentCaptor<Conta> contaCaptor = ArgumentCaptor.forClass(Conta.class);
        verify(contaRepository).findById(contaId);
        verify(contaRepository).save(contaCaptor.capture());
        Conta contaSalva = contaCaptor.getValue();
        assertThat(contaSalva.getSaldo()).isEqualTo(saldoEsperado);
    }
    @Test
    @DisplayName("Deve lançar exceção ao creditar valor em conta não encontrada")
    void deveLancarExcecaoAoCreditarValorEmContaNaoEncontrada() {
        Long contaId = 999L;
        BigDecimal valorCredito = new BigDecimal("100.00");
        when(contaRepository.findById(contaId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> accountService.creditarConta(contaId, valorCredito))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Conta não encontrada");
        verify(contaRepository).findById(contaId);
        verify(contaRepository, never()).save(any());
    }
    @Test
    @DisplayName("Deve debitar valor da conta com sucesso")
    void deveDebitarValorDaContaComSucesso() {
        Long contaId = 1L;
        BigDecimal valorDebito = new BigDecimal("50.00");
        BigDecimal saldoAtual = new BigDecimal("100.00");
        BigDecimal saldoEsperado = new BigDecimal("50.00");
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoAtual)
                .build();
        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        when(contaRepository.save(any(Conta.class))).thenReturn(conta);
        accountService.debitarConta(contaId, valorDebito);
        ArgumentCaptor<Conta> contaCaptor = ArgumentCaptor.forClass(Conta.class);
        verify(contaRepository).findById(contaId);
        verify(contaRepository).save(contaCaptor.capture());
        Conta contaSalva = contaCaptor.getValue();
        assertThat(contaSalva.getSaldo()).isEqualTo(saldoEsperado);
    }
    @Test
    @DisplayName("Deve lançar exceção ao debitar valor maior que saldo")
    void deveLancarExcecaoAoDebitarValorMaiorQueSaldo() {
        Long contaId = 1L;
        BigDecimal valorDebito = new BigDecimal("150.00");
        BigDecimal saldoAtual = new BigDecimal("100.00");
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoAtual)
                .build();
        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        assertThatThrownBy(() -> accountService.debitarConta(contaId, valorDebito))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Saldo insuficiente");
        verify(contaRepository).findById(contaId);
        verify(contaRepository, never()).save(any());
    }
    @Test
    @DisplayName("Deve adicionar cédulas ao estoque existente")
    void deveAdicionarCedulasAoEstoqueExistente() {
        ValorCedula valorCedula = ValorCedula.CEM;
        int quantidadeExistente = 10;
        int quantidadeAdicionar = 5;
        int quantidadeEsperada = 15;
        EstoqueGlobal estoqueExistente = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(quantidadeExistente)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoqueExistente));
        when(estoqueGlobalRepository.save(any(EstoqueGlobal.class)))
                .thenReturn(estoqueExistente);
        accountService.adicionarCedulas(valorCedula, quantidadeAdicionar);
        ArgumentCaptor<EstoqueGlobal> estoqueCaptor = ArgumentCaptor.forClass(EstoqueGlobal.class);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository).save(estoqueCaptor.capture());
        EstoqueGlobal estoqueSalvo = estoqueCaptor.getValue();
        assertThat(estoqueSalvo.getQuantidade()).isEqualTo(quantidadeEsperada);
    }
    @Test
    @DisplayName("Deve criar novo estoque quando não existir")
    void deveCriarNovoEstoqueQuandoNaoExistir() {
        ValorCedula valorCedula = ValorCedula.CINQUENTA;
        int quantidadeAdicionar = 10;
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.empty());
        when(estoqueGlobalRepository.save(any(EstoqueGlobal.class)))
                .thenReturn(new EstoqueGlobal());
        accountService.adicionarCedulas(valorCedula, quantidadeAdicionar);
        ArgumentCaptor<EstoqueGlobal> estoqueCaptor = ArgumentCaptor.forClass(EstoqueGlobal.class);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository).save(estoqueCaptor.capture());
        EstoqueGlobal estoqueSalvo = estoqueCaptor.getValue();
        assertThat(estoqueSalvo.getValorCedula()).isEqualTo(valorCedula);
        assertThat(estoqueSalvo.getQuantidade()).isEqualTo(quantidadeAdicionar);
    }
    @Test
    @DisplayName("Deve remover cédulas do estoque com sucesso")
    void deveRemoverCedulasDoEstoqueComSucesso() {
        ValorCedula valorCedula = ValorCedula.VINTE;
        int quantidadeExistente = 20;
        int quantidadeRemover = 5;
        int quantidadeEsperada = 15;
        EstoqueGlobal estoqueExistente = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(quantidadeExistente)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoqueExistente));
        when(estoqueGlobalRepository.save(any(EstoqueGlobal.class)))
                .thenReturn(estoqueExistente);
        accountService.removerCedulas(valorCedula, quantidadeRemover);
        ArgumentCaptor<EstoqueGlobal> estoqueCaptor = ArgumentCaptor.forClass(EstoqueGlobal.class);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository).save(estoqueCaptor.capture());
        EstoqueGlobal estoqueSalvo = estoqueCaptor.getValue();
        assertThat(estoqueSalvo.getQuantidade()).isEqualTo(quantidadeEsperada);
    }
    @Test
    @DisplayName("Deve lançar exceção ao tentar remover cédulas de estoque não encontrado")
    void deveLancarExcecaoAoTentarRemoverCedulasDeEstoqueNaoEncontrado() {
        ValorCedula valorCedula = ValorCedula.DEZ;
        int quantidadeRemover = 5;
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.empty());
        assertThatThrownBy(() -> accountService.removerCedulas(valorCedula, quantidadeRemover))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Estoque não encontrado");
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository, never()).save(any());
    }
    @Test
    @DisplayName("Deve obter estoque global ordenado por valor decrescente")
    void deveObterEstoqueGlobalOrdenadoPorValorDecrescente() {
        List<EstoqueGlobal> estoqueEsperado = Arrays.asList(
                TestDataBuilder.umEstoqueGlobal().comValorCedula(ValorCedula.CEM).build(),
                TestDataBuilder.umEstoqueGlobal().comValorCedula(ValorCedula.CINQUENTA).build(),
                TestDataBuilder.umEstoqueGlobal().comValorCedula(ValorCedula.VINTE).build()
        );
        when(estoqueGlobalRepository.findAllByOrderByValorCedulaDesc())
                .thenReturn(estoqueEsperado);
        List<EstoqueGlobal> resultado = accountService.obterEstoqueGlobal();
        assertThat(resultado).isEqualTo(estoqueEsperado);
        verify(estoqueGlobalRepository).findAllByOrderByValorCedulaDesc();
    }
    @Test
    @DisplayName("Deve obter saldo da conta com sucesso")
    void deveObterSaldoDaContaComSucesso() {
        Long contaId = 1L;
        BigDecimal saldoEsperado = new BigDecimal("250.00");
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoEsperado)
                .build();
        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        BigDecimal saldo = accountService.obterSaldo(contaId);
        assertThat(saldo).isEqualTo(saldoEsperado);
        verify(contaRepository).findById(contaId);
    }
    @Test
    @DisplayName("Deve verificar saldo suficiente quando saldo é maior que valor")
    void deveVerificarSaldoSuficienteQuandoSaldoEMaiorQueValor() {
        Long contaId = 1L;
        BigDecimal saldoAtual = new BigDecimal("100.00");
        BigDecimal valorVerificar = new BigDecimal("50.00");
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoAtual)
                .build();
        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        boolean resultado = accountService.verificarSaldoSuficiente(contaId, valorVerificar);
        assertThat(resultado).isTrue();
        verify(contaRepository).findById(contaId);
    }
    @Test
    @DisplayName("Deve verificar saldo insuficiente quando saldo é menor que valor")
    void deveVerificarSaldoInsuficienteQuandoSaldoEMenorQueValor() {
        Long contaId = 1L;
        BigDecimal saldoAtual = new BigDecimal("30.00");
        BigDecimal valorVerificar = new BigDecimal("50.00");
        Conta conta = TestDataBuilder.umaConta()
                .comId(contaId)
                .comSaldo(saldoAtual)
                .build();
        when(contaRepository.findById(contaId)).thenReturn(Optional.of(conta));
        boolean resultado = accountService.verificarSaldoSuficiente(contaId, valorVerificar);
        assertThat(resultado).isFalse();
        verify(contaRepository).findById(contaId);
    }
    @Test
    @DisplayName("Deve obter conta do usuário com sucesso")
    void deveObterContaDoUsuarioComSucesso() {
        Usuario usuario = TestDataBuilder.umUsuario().build();
        Conta contaEsperada = TestDataBuilder.umaConta().comUsuario(usuario).build();
        when(contaRepository.findByUsuario(usuario)).thenReturn(Optional.of(contaEsperada));
        Conta conta = accountService.obterContaDoUsuario(usuario);
        assertThat(conta).isEqualTo(contaEsperada);
        verify(contaRepository).findByUsuario(usuario);
    }
    @Test
    @DisplayName("Deve lançar exceção quando usuário não possui conta")
    void deveLancarExcecaoQuandoUsuarioNaoPossuiConta() {
        Usuario usuario = TestDataBuilder.umUsuario().build();
        when(contaRepository.findByUsuario(usuario)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> accountService.obterContaDoUsuario(usuario))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Usuário não possui conta");
        verify(contaRepository).findByUsuario(usuario);
    }
    @Test
    @DisplayName("Deve obter conta por ID com sucesso")
    void deveObterContaPorIdComSucesso() {
        Long contaId = 1L;
        Conta contaEsperada = TestDataBuilder.umaConta().comId(contaId).build();
        when(contaRepository.findById(contaId)).thenReturn(Optional.of(contaEsperada));
        Conta conta = accountService.obterContaPorId(contaId);
        assertThat(conta).isEqualTo(contaEsperada);
        verify(contaRepository).findById(contaId);
    }
    @Test
    @DisplayName("Deve lançar exceção ao buscar conta por ID não encontrado")
    void deveLancarExcecaoAoBuscarContaPorIdNaoEncontrado() {
        Long contaId = 999L;
        when(contaRepository.findById(contaId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> accountService.obterContaPorId(contaId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Conta não encontrada");
        verify(contaRepository).findById(contaId);
    }
}
