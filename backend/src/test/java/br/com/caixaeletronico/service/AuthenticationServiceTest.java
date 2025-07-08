package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PerfilUsuario;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.UsuarioRepository;
import br.com.caixaeletronico.util.TestDataBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationService Tests")
class AuthenticationServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ContaRepository contaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthenticationService authenticationService;

    @Test
    @DisplayName("Deve registrar novo usuário com sucesso")
    void deveRegistrarNovoUsuarioComSucesso() {
        // Given
        String login = "joao123";
        String email = "joao@email.com";
        String senha = "senha123";
        String senhaEncriptada = "$2a$10$encodedPassword";
        PerfilUsuario perfil = PerfilUsuario.CLIENTE;

        Usuario usuarioEsperado = TestDataBuilder.umUsuario()
                .comLogin(login)
                .comEmail(email)
                .comSenha(senhaEncriptada)
                .comPerfil(perfil)
                .build();

        when(usuarioRepository.existsByLogin(login)).thenReturn(false);
        when(usuarioRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(senha)).thenReturn(senhaEncriptada);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioEsperado);

        // When
        Usuario resultado = authenticationService.registrarUsuario(login, email, senha, perfil);

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado.getLogin()).isEqualTo(login);
        assertThat(resultado.getEmail()).isEqualTo(email);
        assertThat(resultado.getSenha()).isEqualTo(senhaEncriptada);
        assertThat(resultado.getPerfil()).isEqualTo(perfil);

        verify(usuarioRepository).existsByLogin(login);
        verify(usuarioRepository).existsByEmail(email);
        verify(passwordEncoder).encode(senha);
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando login já existe")
    void deveLancarExcecaoQuandoLoginJaExiste() {
        // Given
        String login = "joao123";
        String email = "joao@email.com";
        String senha = "senha123";
        PerfilUsuario perfil = PerfilUsuario.CLIENTE;

        when(usuarioRepository.existsByLogin(login)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> 
            authenticationService.registrarUsuario(login, email, senha, perfil))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Login já cadastrado");

        verify(usuarioRepository).existsByLogin(login);
        verify(usuarioRepository, never()).existsByEmail(anyString());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando email já existe")
    void deveLancarExcecaoQuandoEmailJaExiste() {
        // Given
        String login = "joao123";
        String email = "joao@email.com";
        String senha = "senha123";
        PerfilUsuario perfil = PerfilUsuario.CLIENTE;

        when(usuarioRepository.existsByLogin(login)).thenReturn(false);
        when(usuarioRepository.existsByEmail(email)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> 
            authenticationService.registrarUsuario(login, email, senha, perfil))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email já cadastrado");

        verify(usuarioRepository).existsByLogin(login);
        verify(usuarioRepository).existsByEmail(email);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve autenticar usuário com credenciais válidas")
    void deveAutenticarUsuarioComCredenciaisValidas() {
        // Given
        String login = "joao123";
        String senha = "senha123";
        String senhaEncriptada = "$2a$10$encodedPassword";
        String token = "jwt.token.here";

        Usuario usuario = TestDataBuilder.umUsuario()
                .comLogin(login)
                .comSenha(senhaEncriptada)
                .build();

        when(usuarioRepository.findByLogin(login)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(senha, senhaEncriptada)).thenReturn(true);
        when(jwtService.gerarToken(login)).thenReturn(token);

        // When
        String resultado = authenticationService.autenticar(login, senha);

        // Then
        assertThat(resultado).isEqualTo(token);

        verify(usuarioRepository).findByLogin(login);
        verify(passwordEncoder).matches(senha, senhaEncriptada);
        verify(jwtService).gerarToken(login);
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não encontrado na autenticação")
    void deveLancarExcecaoQuandoUsuarioNaoEncontradoNaAutenticacao() {
        // Given
        String login = "inexistente";
        String senha = "senha123";

        when(usuarioRepository.findByLogin(login)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.autenticar(login, senha))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Usuário não encontrado");

        verify(usuarioRepository).findByLogin(login);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).gerarToken(anyString());
    }

    @Test
    @DisplayName("Deve lançar exceção quando senha é inválida")
    void deveLancarExcecaoQuandoSenhaEInvalida() {
        // Given
        String login = "joao123";
        String senha = "senhaErrada";
        String senhaEncriptada = "$2a$10$encodedPassword";

        Usuario usuario = TestDataBuilder.umUsuario()
                .comLogin(login)
                .comSenha(senhaEncriptada)
                .build();

        when(usuarioRepository.findByLogin(login)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(senha, senhaEncriptada)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authenticationService.autenticar(login, senha))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Senha incorreta");

        verify(usuarioRepository).findByLogin(login);
        verify(passwordEncoder).matches(senha, senhaEncriptada);
        verify(jwtService, never()).gerarToken(anyString());
    }

    @Test
    @DisplayName("Deve criar conta para cliente automaticamente no registro")
    void deveCriarContaParaClienteAutomaticamenteNoRegistro() {
        // Given
        String login = "cliente123";
        String email = "cliente@email.com";
        String senha = "senha123";
        String senhaEncriptada = "$2a$10$encodedPassword";
        PerfilUsuario perfil = PerfilUsuario.CLIENTE;

        Usuario usuarioSalvo = TestDataBuilder.umUsuario()
                .comId(1L)
                .comLogin(login)
                .comEmail(email)
                .comSenha(senhaEncriptada)
                .comPerfil(perfil)
                .build();

        when(usuarioRepository.existsByLogin(login)).thenReturn(false);
        when(usuarioRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(senha)).thenReturn(senhaEncriptada);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioSalvo);

        // When
        authenticationService.registrarUsuario(login, email, senha, perfil);

        // Then
        ArgumentCaptor<Conta> contaCaptor = ArgumentCaptor.forClass(Conta.class);
        verify(contaRepository).save(contaCaptor.capture());

        Conta contaCriada = contaCaptor.getValue();
        assertThat(contaCriada.getTitular()).isEqualTo(login);
        assertThat(contaCriada.getSaldo()).isEqualTo(BigDecimal.ZERO);
        assertThat(contaCriada.getUsuario()).isEqualTo(usuarioSalvo);
        assertThat(contaCriada.getNumeroConta()).isNotBlank();
    }

    @Test
    @DisplayName("Não deve criar conta para administrador no registro")
    void naoDeveCriarContaParaAdministradorNoRegistro() {
        // Given
        String login = "admin123";
        String email = "admin@email.com";
        String senha = "senha123";
        String senhaEncriptada = "$2a$10$encodedPassword";
        PerfilUsuario perfil = PerfilUsuario.ADMIN;

        Usuario usuarioEsperado = TestDataBuilder.umUsuario()
                .comLogin(login)
                .comEmail(email)
                .comSenha(senhaEncriptada)
                .comPerfil(perfil)
                .build();

        when(usuarioRepository.existsByLogin(login)).thenReturn(false);
        when(usuarioRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(senha)).thenReturn(senhaEncriptada);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioEsperado);

        // When
        authenticationService.registrarUsuario(login, email, senha, perfil);

        // Then
        verify(contaRepository, never()).save(any(Conta.class));
    }
}
