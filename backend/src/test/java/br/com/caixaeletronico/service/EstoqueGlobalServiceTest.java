package br.com.caixaeletronico.service;
import br.com.caixaeletronico.model.EstoqueGlobal;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.repository.EstoqueGlobalRepository;
import br.com.caixaeletronico.util.TestDataBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
@DisplayName("EstoqueGlobalService Tests")
class EstoqueGlobalServiceTest {
    @Mock
    private EstoqueGlobalRepository estoqueGlobalRepository;
    @InjectMocks
    private EstoqueGlobalService estoqueGlobalService;
    @Test
    @DisplayName("Deve obter estoque global ordenado por valor decrescente")
    void deveObterEstoqueGlobalOrdenadoPorValorDecrescente() {
        List<EstoqueGlobal> estoqueEsperado = Arrays.asList(
                TestDataBuilder.umEstoqueGlobal().comValorCedula(ValorCedula.CEM).comQuantidade(50).build(),
                TestDataBuilder.umEstoqueGlobal().comValorCedula(ValorCedula.CINQUENTA).comQuantidade(30).build(),
                TestDataBuilder.umEstoqueGlobal().comValorCedula(ValorCedula.VINTE).comQuantidade(20).build(),
                TestDataBuilder.umEstoqueGlobal().comValorCedula(ValorCedula.DEZ).comQuantidade(40).build()
        );
        when(estoqueGlobalRepository.findAllByOrderByValorCedulaDesc())
                .thenReturn(estoqueEsperado);
        List<EstoqueGlobal> resultado = estoqueGlobalService.obterEstoqueGlobal();
        assertThat(resultado).hasSize(4);
        assertThat(resultado).isEqualTo(estoqueEsperado);
        verify(estoqueGlobalRepository).findAllByOrderByValorCedulaDesc();
    }
    @Test
    @DisplayName("Deve obter estoque por valor de cédula existente")
    void deveObterEstoquePorValorDeCedulaExistente() {
        ValorCedula valorCedula = ValorCedula.CINQUENTA;
        EstoqueGlobal estoqueEsperado = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(25)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoqueEsperado));
        EstoqueGlobal resultado = estoqueGlobalService.obterEstoquePorValor(valorCedula);
        assertThat(resultado).isEqualTo(estoqueEsperado);
        assertThat(resultado.getValorCedula()).isEqualTo(valorCedula);
        assertThat(resultado.getQuantidade()).isEqualTo(25);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
    }
    @Test
    @DisplayName("Deve lançar exceção ao buscar estoque por valor não encontrado")
    void deveLancarExcecaoAoBuscarEstoquePorValorNaoEncontrado() {
        ValorCedula valorCedula = ValorCedula.DOIS;
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.empty());
        assertThatThrownBy(() -> estoqueGlobalService.obterEstoquePorValor(valorCedula))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Estoque não encontrado para cédula " + valorCedula);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
    }
    @Test
    @DisplayName("Deve adicionar cédulas ao estoque existente")
    void deveAdicionarCedulasAoEstoqueExistente() {
        ValorCedula valorCedula = ValorCedula.VINTE;
        int quantidadeExistente = 15;
        int quantidadeAdicionar = 10;
        int quantidadeEsperada = 25;
        EstoqueGlobal estoqueExistente = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(quantidadeExistente)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoqueExistente));
        estoqueGlobalService.adicionarCedulas(valorCedula, quantidadeAdicionar);
        ArgumentCaptor<EstoqueGlobal> estoqueCaptor = ArgumentCaptor.forClass(EstoqueGlobal.class);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository).save(estoqueCaptor.capture());
        EstoqueGlobal estoqueSalvo = estoqueCaptor.getValue();
        assertThat(estoqueSalvo.getQuantidade()).isEqualTo(quantidadeEsperada);
        assertThat(estoqueSalvo.getValorCedula()).isEqualTo(valorCedula);
    }
    @Test
    @DisplayName("Deve criar novo estoque ao adicionar cédulas inexistentes")
    void deveCriarNovoEstoqueAoAdicionarCedulasInexistentes() {
        ValorCedula valorCedula = ValorCedula.CINCO;
        int quantidadeAdicionar = 20;
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.empty());
        estoqueGlobalService.adicionarCedulas(valorCedula, quantidadeAdicionar);
        ArgumentCaptor<EstoqueGlobal> estoqueCaptor = ArgumentCaptor.forClass(EstoqueGlobal.class);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository).save(estoqueCaptor.capture());
        EstoqueGlobal novoEstoque = estoqueCaptor.getValue();
        assertThat(novoEstoque.getQuantidade()).isEqualTo(quantidadeAdicionar);
        assertThat(novoEstoque.getValorCedula()).isEqualTo(valorCedula);
    }
    @ParameterizedTest
    @EnumSource(ValorCedula.class)
    @DisplayName("Deve adicionar cédulas para todos os valores de cédula")
    void deveAdicionarCedulasParaTodosOsValoresDeCedula(ValorCedula valorCedula) {
        int quantidadeAdicionar = 10;
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.empty());
        estoqueGlobalService.adicionarCedulas(valorCedula, quantidadeAdicionar);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository).save(any(EstoqueGlobal.class));
    }
    @Test
    @DisplayName("Deve remover cédulas do estoque com sucesso")
    void deveRemoverCedulasDoEstoqueComSucesso() {
        ValorCedula valorCedula = ValorCedula.CEM;
        int quantidadeExistente = 30;
        int quantidadeRemover = 10;
        int quantidadeEsperada = 20;
        EstoqueGlobal estoqueExistente = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(quantidadeExistente)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoqueExistente));
        estoqueGlobalService.removerCedulas(valorCedula, quantidadeRemover);
        ArgumentCaptor<EstoqueGlobal> estoqueCaptor = ArgumentCaptor.forClass(EstoqueGlobal.class);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository).save(estoqueCaptor.capture());
        EstoqueGlobal estoqueSalvo = estoqueCaptor.getValue();
        assertThat(estoqueSalvo.getQuantidade()).isEqualTo(quantidadeEsperada);
    }
    @Test
    @DisplayName("Deve lançar exceção ao tentar remover de estoque não encontrado")
    void deveLancarExcecaoAoTentarRemoverDeEstoqueNaoEncontrado() {
        ValorCedula valorCedula = ValorCedula.DEZ;
        int quantidadeRemover = 5;
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.empty());
        assertThatThrownBy(() -> estoqueGlobalService.removerCedulas(valorCedula, quantidadeRemover))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Estoque não encontrado para cédula " + valorCedula);
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository, never()).save(any());
    }
    @Test
    @DisplayName("Deve lançar exceção ao tentar remover quantidade maior que disponível")
    void deveLancarExcecaoAoTentarRemoverQuantidadeMaiorQueDisponivel() {
        ValorCedula valorCedula = ValorCedula.CINQUENTA;
        int quantidadeExistente = 5;
        int quantidadeRemover = 10;
        EstoqueGlobal estoqueExistente = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(quantidadeExistente)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoqueExistente));
        assertThatThrownBy(() -> estoqueGlobalService.removerCedulas(valorCedula, quantidadeRemover))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Quantidade insuficiente no estoque");
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
        verify(estoqueGlobalRepository, never()).save(any());
    }
    @Test
    @DisplayName("Deve verificar disponibilidade quando há quantidade suficiente")
    void deveVerificarDisponibilidadeQuandoHaQuantidadeSuficiente() {
        ValorCedula valorCedula = ValorCedula.VINTE;
        int quantidadeDisponivel = 25;
        int quantidadeNecessaria = 10;
        EstoqueGlobal estoque = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(quantidadeDisponivel)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoque));
        boolean resultado = estoqueGlobalService.verificarDisponibilidade(valorCedula, quantidadeNecessaria);
        assertThat(resultado).isTrue();
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
    }
    @Test
    @DisplayName("Deve verificar indisponibilidade quando não há quantidade suficiente")
    void deveVerificarIndisponibilidadeQuandoNaoHaQuantidadeSuficiente() {
        ValorCedula valorCedula = ValorCedula.DEZ;
        int quantidadeDisponivel = 5;
        int quantidadeNecessaria = 10;
        EstoqueGlobal estoque = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(quantidadeDisponivel)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoque));
        boolean resultado = estoqueGlobalService.verificarDisponibilidade(valorCedula, quantidadeNecessaria);
        assertThat(resultado).isFalse();
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
    }
    @Test
    @DisplayName("Deve retornar false para disponibilidade quando estoque não existe")
    void deveRetornarFalseParaDisponibilidadeQuandoEstoqueNaoExiste() {
        ValorCedula valorCedula = ValorCedula.DOIS;
        int quantidadeNecessaria = 5;
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.empty());
        boolean resultado = estoqueGlobalService.verificarDisponibilidade(valorCedula, quantidadeNecessaria);
        assertThat(resultado).isFalse();
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
    }
    @Test
    @DisplayName("Deve retornar true quando quantidade necessária é zero")
    void deveRetornarTrueQuandoQuantidadeNecessariaEZero() {
        ValorCedula valorCedula = ValorCedula.CINCO;
        int quantidadeNecessaria = 0;
        EstoqueGlobal estoque = TestDataBuilder.umEstoqueGlobal()
                .comValorCedula(valorCedula)
                .comQuantidade(10)
                .build();
        when(estoqueGlobalRepository.findByValorCedula(valorCedula))
                .thenReturn(Optional.of(estoque));
        boolean resultado = estoqueGlobalService.verificarDisponibilidade(valorCedula, quantidadeNecessaria);
        assertThat(resultado).isTrue();
        verify(estoqueGlobalRepository).findByValorCedula(valorCedula);
    }
}
