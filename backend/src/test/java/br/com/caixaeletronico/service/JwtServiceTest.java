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
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "minha-chave-secreta-super-segura-para-jwt-tokens-teste");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
    }
    @Test
    @DisplayName("Deve gerar token JWT válido")
    void deveGerarTokenJwtValido() {
        String login = "joao123";
        String token = jwtService.gerarToken(login);
        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }
    @Test
    @DisplayName("Deve extrair login do token corretamente")
    void deveExtrairLoginDoTokenCorretamente() {
        String loginOriginal = "maria456";
        String token = jwtService.gerarToken(loginOriginal);
        String loginExtraido = jwtService.extrairLogin(token);
        assertThat(loginExtraido).isEqualTo(loginOriginal);
    }
    @Test
    @DisplayName("Deve extrair data de expiração do token")
    void deveExtrairDataDeExpiracaoDoToken() {
        String login = "admin789";
        String token = jwtService.gerarToken(login);
        Date dataExpiracao = jwtService.extrairDataExpiracao(token);
        assertThat(dataExpiracao).isNotNull();
        assertThat(dataExpiracao).isAfter(new Date());
    }
    @Test
    @DisplayName("Deve validar token válido corretamente")
    void deveValidarTokenValidoCorretamente() {
        String login = "usuario123";
        String token = jwtService.gerarToken(login);
        Boolean tokenValido = jwtService.validarToken(token);
        assertThat(tokenValido).isTrue();
    }
    @Test
    @DisplayName("Deve invalidar token malformado")
    void deveInvalidarTokenMalformado() {
        String tokenMalformado = "token.malformado.invalido";
        Boolean tokenValido = jwtService.validarToken(tokenMalformado);
        assertThat(tokenValido).isFalse();
    }
    @Test
    @DisplayName("Deve detectar token expirado")
    void deveDetectarTokenExpirado() {
        String login = "usuario123";
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);
        String tokenExpiradoStr = jwtService.gerarToken(login);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
        Boolean tokenValido = jwtService.validarToken(tokenExpiradoStr);
        assertThat(tokenValido).isFalse();
    }
    @Test
    @DisplayName("Deve identificar token não expirado")
    void deveIdentificarTokenNaoExpirado() {
        String login = "usuario123";
        String token = jwtService.gerarToken(login);
        Boolean tokenValido = jwtService.validarToken(token);
        assertThat(tokenValido).isTrue();
    }
    @Test
    @DisplayName("Deve lançar exceção para token malformado")
    void deveLancarExcecaoParaTokenMalformado() {
        String tokenMalformado = "token.malformado.invalido";
        assertThatThrownBy(() -> jwtService.extrairLogin(tokenMalformado))
                .isInstanceOf(Exception.class);
    }
    @Test
    @DisplayName("Deve lançar exceção para token vazio")
    void deveLancarExcecaoParaTokenVazio() {
        String tokenVazio = "";
        assertThatThrownBy(() -> jwtService.extrairLogin(tokenVazio))
                .isInstanceOf(Exception.class);
    }
    @Test
    @DisplayName("Deve lançar exceção para token nulo")
    void deveLancarExcecaoParaTokenNulo() {
        String tokenNulo = null;
        assertThatThrownBy(() -> jwtService.extrairLogin(tokenNulo))
                .isInstanceOf(Exception.class);
    }
    @Test
    @DisplayName("Deve gerar tokens diferentes para o mesmo login")
    void deveGerarTokensDiferentesParaOMesmoLogin() throws InterruptedException {
        String login = "usuario123";
        String token1 = jwtService.gerarToken(login);
        Thread.sleep(1);
        String token2 = jwtService.gerarToken(login);
        assertThat(token1).isNotEqualTo(token2);
        assertThat(jwtService.extrairLogin(token1)).isEqualTo(login);
        assertThat(jwtService.extrairLogin(token2)).isEqualTo(login);
    }
    @Test
    @DisplayName("Deve validar token com caracteres especiais no login")
    void deveValidarTokenComCaracteresEspeciaisNoLogin() {
        String loginEspecial = "usuario@email.com";
        String token = jwtService.gerarToken(loginEspecial);
        String loginExtraido = jwtService.extrairLogin(token);
        Boolean tokenValido = jwtService.validarToken(token);
        assertThat(loginExtraido).isEqualTo(loginEspecial);
        assertThat(tokenValido).isTrue();
    }
}
