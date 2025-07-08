package br.com.caixaeletronico.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtService Tests")
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        // Configura propriedades do JWT para os testes
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "minha-chave-secreta-super-segura-para-jwt-tokens-teste");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L); // 24 horas
    }

    @Test
    @DisplayName("Deve gerar token JWT válido")
    void deveGerarTokenJwtValido() {
        // Given
        String login = "joao123";

        // When
        String token = jwtService.gerarToken(login);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // JWT tem 3 partes separadas por ponto
    }

    @Test
    @DisplayName("Deve extrair login do token corretamente")
    void deveExtrairLoginDoTokenCorretamente() {
        // Given
        String loginOriginal = "maria456";
        String token = jwtService.gerarToken(loginOriginal);

        // When
        String loginExtraido = jwtService.extrairLogin(token);

        // Then
        assertThat(loginExtraido).isEqualTo(loginOriginal);
    }

    @Test
    @DisplayName("Deve extrair data de expiração do token")
    void deveExtrairDataDeExpiracaoDoToken() {
        // Given
        String login = "admin789";
        String token = jwtService.gerarToken(login);

        // When
        Date dataExpiracao = jwtService.extrairDataExpiracao(token);

        // Then
        assertThat(dataExpiracao).isNotNull();
        assertThat(dataExpiracao).isAfter(new Date()); // Data deve ser no futuro
    }

    @Test
    @DisplayName("Deve validar token válido corretamente")
    void deveValidarTokenValidoCorretamente() {
        // Given
        String login = "usuario123";
        String token = jwtService.gerarToken(login);

        // When
        Boolean tokenValido = jwtService.validarToken(token);

        // Then
        assertThat(tokenValido).isTrue();
    }

    @Test
    @DisplayName("Deve invalidar token malformado")
    void deveInvalidarTokenMalformado() {
        // Given
        String tokenMalformado = "token.malformado.invalido";

        // When
        Boolean tokenValido = jwtService.validarToken(tokenMalformado);

        // Then
        assertThat(tokenValido).isFalse();
    }

    @Test
    @DisplayName("Deve detectar token expirado")
    void deveDetectarTokenExpirado() {
        // Given
        String login = "usuario123";
        
        // Configura expiração muito curta para simular token expirado
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L); // Já expirado
        String tokenExpiradoStr = jwtService.gerarToken(login);
        
        // Restaura expiração normal
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        // When
        Boolean tokenValido = jwtService.validarToken(tokenExpiradoStr);

        // Then
        assertThat(tokenValido).isFalse();
    }

    @Test
    @DisplayName("Deve identificar token não expirado")
    void deveIdentificarTokenNaoExpirado() {
        // Given
        String login = "usuario123";
        String token = jwtService.gerarToken(login);

        // When
        Boolean tokenValido = jwtService.validarToken(token);

        // Then
        assertThat(tokenValido).isTrue();
    }

    @Test
    @DisplayName("Deve lançar exceção para token malformado")
    void deveLancarExcecaoParaTokenMalformado() {
        // Given
        String tokenMalformado = "token.malformado.invalido";

        // When & Then
        assertThatThrownBy(() -> jwtService.extrairLogin(tokenMalformado))
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("Deve lançar exceção para token vazio")
    void deveLancarExcecaoParaTokenVazio() {
        // Given
        String tokenVazio = "";

        // When & Then
        assertThatThrownBy(() -> jwtService.extrairLogin(tokenVazio))
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("Deve lançar exceção para token nulo")
    void deveLancarExcecaoParaTokenNulo() {
        // Given
        String tokenNulo = null;

        // When & Then
        assertThatThrownBy(() -> jwtService.extrairLogin(tokenNulo))
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("Deve gerar tokens diferentes para o mesmo login")
    void deveGerarTokensDiferentesParaOMesmoLogin() throws InterruptedException {
        // Given
        String login = "usuario123";

        // When
        String token1 = jwtService.gerarToken(login);
        Thread.sleep(1); // Pequena pausa para garantir timestamp diferente
        String token2 = jwtService.gerarToken(login);

        // Then
        assertThat(token1).isNotEqualTo(token2); // Tokens devem ser diferentes devido ao timestamp
        assertThat(jwtService.extrairLogin(token1)).isEqualTo(login);
        assertThat(jwtService.extrairLogin(token2)).isEqualTo(login);
    }

    @Test
    @DisplayName("Deve validar token com caracteres especiais no login")
    void deveValidarTokenComCaracteresEspeciaisNoLogin() {
        // Given
        String loginEspecial = "usuario@email.com";
        String token = jwtService.gerarToken(loginEspecial);

        // When
        String loginExtraido = jwtService.extrairLogin(token);
        Boolean tokenValido = jwtService.validarToken(token);

        // Then
        assertThat(loginExtraido).isEqualTo(loginEspecial);
        assertThat(tokenValido).isTrue();
    }
}
