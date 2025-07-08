package br.com.caixaeletronico.service;

import br.com.caixaeletronico.command.CommandFactory;
import br.com.caixaeletronico.command.OperacaoCommand;
import br.com.caixaeletronico.event.OperationCompletedEvent;
import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.EstoqueGlobalRepository;
import br.com.caixaeletronico.repository.OperacaoRepository;
import br.com.caixaeletronico.repository.UsuarioRepository;
import br.com.caixaeletronico.util.TestDataBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CommandManagerService Tests")
class CommandManagerServiceTest {

    @Mock
    private CommandFactory commandFactory;

    @Mock
    private OperacaoRepository operacaoRepository;

    @Mock
    private ContaRepository contaRepository;

    @Mock
    private EstoqueGlobalRepository estoqueGlobalRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private OperacaoCommand operacaoCommand;

    @InjectMocks
    private CommandManagerService commandManagerService;

    @Test
    @DisplayName("Deve executar comando de depósito com sucesso")
    void deveExecutarComandoDeDepositoComSucesso() {
        // Given
        TipoOperacao tipo = TipoOperacao.DEPOSITO;
        Usuario usuario = TestDataBuilder.umUsuario().build();
        String emailUsuario = "joao@email.com";
        BigDecimal valor = new BigDecimal("200.00");
        Object[] parametros = {valor};

        OperationMemento memento = new OperationMemento();
        Operacao operacaoEsperada = TestDataBuilder.umaOperacao()
                .comTipo(tipo)
                .comValor(valor)
                .comUsuarioResponsavel(emailUsuario)
                .build();

        when(commandFactory.criarCommand(tipo, usuario, parametros))
                .thenReturn(operacaoCommand);
        when(operacaoCommand.gerarMemento()).thenReturn(memento);
        doNothing().when(operacaoCommand).executar();
        when(operacaoRepository.save(any(Operacao.class))).thenReturn(operacaoEsperada);

        // When
        Operacao resultado = commandManagerService.executarComando(tipo, usuario, emailUsuario, parametros);

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado).isEqualTo(operacaoEsperada);

        verify(commandFactory).criarCommand(tipo, usuario, parametros);
        verify(operacaoCommand).gerarMemento();
        verify(operacaoCommand).executar();
        verify(operacaoRepository).save(any(Operacao.class));
        verify(eventPublisher).publishEvent(any(OperationCompletedEvent.class));
    }

    @Test
    @DisplayName("Deve executar comando de saque com sucesso")
    void deveExecutarComandoDeSaqueComSucesso() {
        // Given
        TipoOperacao tipo = TipoOperacao.SAQUE;
        Usuario usuario = TestDataBuilder.umUsuario().build();
        String emailUsuario = "maria@email.com";
        BigDecimal valor = new BigDecimal("150.00");
        Object[] parametros = {valor};

        OperationMemento memento = new OperationMemento();
        Operacao operacaoEsperada = TestDataBuilder.umaOperacao()
                .comTipo(tipo)
                .comValor(valor)
                .comUsuarioResponsavel(emailUsuario)
                .build();

        when(commandFactory.criarCommand(tipo, usuario, parametros))
                .thenReturn(operacaoCommand);
        when(operacaoCommand.gerarMemento()).thenReturn(memento);
        doNothing().when(operacaoCommand).executar();
        when(operacaoRepository.save(any(Operacao.class))).thenReturn(operacaoEsperada);

        // When
        Operacao resultado = commandManagerService.executarComando(tipo, usuario, emailUsuario, parametros);

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado.getTipo()).isEqualTo(tipo);
        assertThat(resultado.getValor()).isEqualTo(valor);

        verify(commandFactory).criarCommand(tipo, usuario, parametros);
        verify(operacaoCommand).gerarMemento();
        verify(operacaoCommand).executar();
        verify(operacaoRepository).save(any(Operacao.class));
        verify(eventPublisher).publishEvent(any(OperationCompletedEvent.class));
    }

    @Test
    @DisplayName("Deve executar comando de transferência com sucesso")
    void deveExecutarComandoDeTransferenciaComSucesso() {
        // Given
        TipoOperacao tipo = TipoOperacao.TRANSFERENCIA;
        Usuario usuario = TestDataBuilder.umUsuario().build();
        String emailUsuario = "usuario@email.com";
        BigDecimal valor = new BigDecimal("300.00");
        String numeroContaDestino = "987654321";
        Object[] parametros = {valor, numeroContaDestino};

        OperationMemento memento = new OperationMemento();
        Operacao operacaoEsperada = TestDataBuilder.umaOperacao()
                .comTipo(tipo)
                .comValor(valor)
                .comUsuarioResponsavel(emailUsuario)
                .build();

        when(commandFactory.criarCommand(tipo, usuario, parametros))
                .thenReturn(operacaoCommand);
        when(operacaoCommand.gerarMemento()).thenReturn(memento);
        doNothing().when(operacaoCommand).executar();
        when(operacaoRepository.save(any(Operacao.class))).thenReturn(operacaoEsperada);

        // When
        Operacao resultado = commandManagerService.executarComando(tipo, usuario, emailUsuario, parametros);

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado.getTipo()).isEqualTo(TipoOperacao.TRANSFERENCIA);

        verify(commandFactory).criarCommand(tipo, usuario, parametros);
        verify(operacaoCommand).gerarMemento();
        verify(operacaoCommand).executar();
        verify(operacaoRepository).save(any(Operacao.class));
        verify(eventPublisher).publishEvent(any(OperationCompletedEvent.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando comando falha na execução")
    void deveLancarExcecaoQuandoComandoFalhaNaExecucao() {
        // Given
        TipoOperacao tipo = TipoOperacao.SAQUE;
        Usuario usuario = TestDataBuilder.umUsuario().build();
        String emailUsuario = "usuario@email.com";
        Object[] parametros = {new BigDecimal("1000.00")};

        OperationMemento memento = new OperationMemento();

        when(commandFactory.criarCommand(tipo, usuario, parametros))
                .thenReturn(operacaoCommand);
        when(operacaoCommand.gerarMemento()).thenReturn(memento);
        doThrow(new RuntimeException("Saldo insuficiente")).when(operacaoCommand).executar();

        // When & Then
        assertThatThrownBy(() -> 
            commandManagerService.executarComando(tipo, usuario, emailUsuario, parametros))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Saldo insuficiente");

        verify(commandFactory).criarCommand(tipo, usuario, parametros);
        verify(operacaoCommand).gerarMemento();
        verify(operacaoCommand).executar();
        verify(operacaoRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    @DisplayName("Deve listar operações de usuário para admin")
    void deveListarOperacoesDeUsuarioParaAdmin() {
        // Given
        Long usuarioId = 1L;
        Usuario admin = TestDataBuilder.umUsuario()
                .comPerfil(PerfilUsuario.ADMIN)
                .build();
        
        Usuario usuarioAlvo = TestDataBuilder.umUsuario()
                .comId(usuarioId)
                .comLogin("usuario123")
                .build();

        List<Operacao> operacoesEsperadas = Arrays.asList(
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.DEPOSITO)
                        .comUsuarioResponsavel("usuario123")
                        .build(),
                TestDataBuilder.umaOperacao()
                        .comTipo(TipoOperacao.SAQUE)
                        .comUsuarioResponsavel("usuario123")
                        .build()
        );

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioAlvo));
        when(operacaoRepository.findByUsuarioResponsavelWithContasOrderByDataHoraDesc("usuario123"))
                .thenReturn(operacoesEsperadas);

        // When
        List<Operacao> resultado = commandManagerService.listarOperacoesUsuario(usuarioId, admin);

        // Then
        assertThat(resultado).isNotNull();
        verify(usuarioRepository).findById(usuarioId);
        verify(operacaoRepository).findByUsuarioResponsavelWithContasOrderByDataHoraDesc("usuario123");
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não admin tenta listar operações")
    void deveLancarExcecaoQuandoUsuarioNaoAdminTentaListarOperacoes() {
        // Given
        Long usuarioId = 1L;
        Usuario usuarioComum = TestDataBuilder.umUsuario()
                .comPerfil(PerfilUsuario.CLIENTE)
                .build();

        // When & Then
        assertThatThrownBy(() -> 
            commandManagerService.listarOperacoesUsuario(usuarioId, usuarioComum))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Apenas administradores podem listar operações de outros usuários");

        verify(usuarioRepository, never()).findById(any());
        verify(operacaoRepository, never()).findByUsuarioResponsavelWithContasOrderByDataHoraDesc(any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário alvo não encontrado")
    void deveLancarExcecaoQuandoUsuarioAlvoNaoEncontrado() {
        // Given
        Long usuarioId = 999L;
        Usuario admin = TestDataBuilder.umUsuario()
                .comPerfil(PerfilUsuario.ADMIN)
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> 
            commandManagerService.listarOperacoesUsuario(usuarioId, admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Usuário não encontrado");

        verify(usuarioRepository).findById(usuarioId);
        verify(operacaoRepository, never()).findByUsuarioResponsavelWithContasOrderByDataHoraDesc(any());
    }

    @Test
    @DisplayName("Deve desfazer operação específica com sucesso")
    void deveDesfazerOperacaoEspecificaComSucesso() throws Exception {
        // Given
        Long operacaoId = 1L;
        Long usuarioId = 2L;
        Usuario admin = TestDataBuilder.umUsuario()
                .comPerfil(PerfilUsuario.ADMIN)
                .comLogin("admin123")
                .comEmail("admin@email.com")
                .build();

        Usuario usuarioAlvo = TestDataBuilder.umUsuario()
                .comId(usuarioId)
                .comLogin("usuario123")
                .build();

        String mementoJson = "{\"saldosAntes\":{\"1\":500.00}}";
        
        Operacao operacaoOriginal = TestDataBuilder.umaOperacao()
                .comId(operacaoId)
                .comTipo(TipoOperacao.DEPOSITO)
                .comValor(new BigDecimal("100.00"))
                .comUsuarioResponsavel("usuario123")
                .build();
        
        operacaoOriginal.setMementoJson(mementoJson);

        OperationMemento memento = new OperationMemento();
        Map<Long, BigDecimal> saldosAntes = new HashMap<>();
        saldosAntes.put(1L, new BigDecimal("500.00"));
        memento.setSaldosAntes(saldosAntes);

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioAlvo));
        when(operacaoRepository.findByIdAndUsuarioResponsavelAndNaoDesfeita(operacaoId, "usuario123"))
                .thenReturn(operacaoOriginal);
        when(objectMapper.readValue(mementoJson, OperationMemento.class)).thenReturn(memento);
        when(operacaoRepository.save(any(Operacao.class))).thenReturn(operacaoOriginal);

        // When
        commandManagerService.desfazerOperacaoEspecifica(operacaoId, usuarioId, admin);

        // Then
        verify(usuarioRepository).findById(usuarioId);
        verify(operacaoRepository).findByIdAndUsuarioResponsavelAndNaoDesfeita(operacaoId, "usuario123");
        verify(objectMapper).readValue(mementoJson, OperationMemento.class);
        verify(operacaoRepository, atLeastOnce()).save(any(Operacao.class));
        verify(eventPublisher).publishEvent(any(OperationCompletedEvent.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não admin tenta desfazer operação específica")
    void deveLancarExcecaoQuandoUsuarioNaoAdminTentaDesfazerOperacaoEspecifica() {
        // Given
        Long operacaoId = 1L;
        Long usuarioId = 2L;
        Usuario usuarioComum = TestDataBuilder.umUsuario()
                .comPerfil(PerfilUsuario.CLIENTE)
                .build();

        // When & Then
        assertThatThrownBy(() -> 
            commandManagerService.desfazerOperacaoEspecifica(operacaoId, usuarioId, usuarioComum))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Apenas administradores podem desfazer operações específicas");

        verify(usuarioRepository, never()).findById(any());
        verify(operacaoRepository, never()).findByIdAndUsuarioResponsavelAndNaoDesfeita(any(), any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário alvo não encontrado para desfazer")
    void deveLancarExcecaoQuandoUsuarioAlvoNaoEncontradoParaDesfazer() {
        // Given
        Long operacaoId = 1L;
        Long usuarioId = 999L;
        Usuario admin = TestDataBuilder.umUsuario()
                .comPerfil(PerfilUsuario.ADMIN)
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> 
            commandManagerService.desfazerOperacaoEspecifica(operacaoId, usuarioId, admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Usuário não encontrado");

        verify(usuarioRepository).findById(usuarioId);
        verify(operacaoRepository, never()).findByIdAndUsuarioResponsavelAndNaoDesfeita(any(), any());
    }

    @Test
    @DisplayName("Deve publicar evento após execução bem-sucedida")
    void devePublicarEventoAposExecucaoBemSucedida() {
        // Given
        TipoOperacao tipo = TipoOperacao.DEPOSITO;
        Usuario usuario = TestDataBuilder.umUsuario().build();
        String emailUsuario = "usuario@email.com";
        Object[] parametros = {new BigDecimal("50.00")};

        OperationMemento memento = new OperationMemento();
        Operacao operacao = TestDataBuilder.umaOperacao().build();

        when(commandFactory.criarCommand(tipo, usuario, parametros))
                .thenReturn(operacaoCommand);
        when(operacaoCommand.gerarMemento()).thenReturn(memento);
        doNothing().when(operacaoCommand).executar();
        when(operacaoRepository.save(any(Operacao.class))).thenReturn(operacao);

        // When
        commandManagerService.executarComando(tipo, usuario, emailUsuario, parametros);

        // Then
        ArgumentCaptor<OperationCompletedEvent> eventCaptor = 
                ArgumentCaptor.forClass(OperationCompletedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        OperationCompletedEvent evento = eventCaptor.getValue();
        assertThat(evento.getOperacao()).isEqualTo(operacao);
        assertThat(evento.getEmailUsuario()).isEqualTo(emailUsuario);
    }
}
