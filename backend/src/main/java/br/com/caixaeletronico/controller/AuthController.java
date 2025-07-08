package br.com.caixaeletronico.controller;
import br.com.caixaeletronico.controller.api.AuthControllerApi;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PerfilUsuario;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.AuthenticationService;
import br.com.caixaeletronico.util.ResponseUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/auth")
public class AuthController implements AuthControllerApi {
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private ContaRepository contaRepository;
    @PostMapping("/register")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequest request) {
        try {
            Usuario usuario = authenticationService.registrarUsuario(
                request.getLogin(), 
                request.getEmail(), 
                request.getSenha(),
                request.getPerfil() != null ? request.getPerfil() : PerfilUsuario.CLIENTE
            );
            Map<String, Object> dadosRegistro = new HashMap<>();
            dadosRegistro.put("usuario", Map.of(
                "userId", usuario.getId(),
                "login", usuario.getLogin(),
                "email", usuario.getEmail(),
                "perfil", usuario.getPerfil()
            ));
            dadosRegistro.put("proximosPassos", List.of(
                "Fazer login para acessar o sistema",
                "Conta bancária será criada automaticamente"
            ));
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Usuário registrado com sucesso", dadosRegistro);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authenticationService.autenticar(request.getLogin(), request.getSenha());
            Usuario usuario = authenticationService.obterUsuarioPorLogin(request.getLogin());
            Map<String, Object> dadosLogin = new HashMap<>();
            dadosLogin.put("autenticacao", Map.of(
                "token", token,
                "type", "Bearer",
                "expiresIn", "24h"
            ));
            dadosLogin.put("usuario", Map.of(
                "userId", usuario.getId(),
                "login", usuario.getLogin(),
                "email", usuario.getEmail(),
                "perfil", usuario.getPerfil()
            ));
            if (PerfilUsuario.CLIENTE.equals(usuario.getPerfil())) {
                Conta conta = usuario.getConta();
                if (conta != null) {
                    dadosLogin.put("conta", ResponseUtil.criarContaBasica(conta));
                }
            }
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Login realizado com sucesso", dadosLogin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> obterUsuarioLogado(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Usuario usuario = authenticationService.obterUsuarioDoToken(jwt)
                .orElseThrow(() -> new RuntimeException("Token inválido"));
            Map<String, Object> dadosUsuario = new HashMap<>();
            dadosUsuario.put("usuario", Map.of(
                "userId", usuario.getId(),
                "login", usuario.getLogin(),
                "email", usuario.getEmail(),
                "perfil", usuario.getPerfil()
            ));
            if (PerfilUsuario.CLIENTE.equals(usuario.getPerfil())) {
                Conta conta = usuario.getConta();
                if (conta != null) {
                    dadosUsuario.put("conta", ResponseUtil.criarContaBasica(conta));
                }
            }
            dadosUsuario.put("sessao", Map.of(
                "ultimaAtividade", java.time.LocalDateTime.now()
            ));
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Dados do usuário obtidos com sucesso", dadosUsuario);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/contas-disponiveis")
    public ResponseEntity<?> listarContasDisponiveis() {
        try {
            List<Conta> todasContas = contaRepository.findAll();
            List<Object> contasInfo = todasContas.stream()
                .map(conta -> ResponseUtil.criarContaBasica(conta))
                .collect(Collectors.toList());
            Map<String, Object> dadosContas = new HashMap<>();
            dadosContas.put("contas", contasInfo);
            dadosContas.put("totalContas", contasInfo.size());
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Contas disponíveis listadas com sucesso", dadosContas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    public static class RegistroRequest {
        private String login;
        private String email;
        private String senha;
        private PerfilUsuario perfil;
        public String getLogin() { return login; }
        public void setLogin(String login) { this.login = login; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
        public PerfilUsuario getPerfil() { return perfil; }
        public void setPerfil(PerfilUsuario perfil) { this.perfil = perfil; }
    }
    public static class LoginRequest {
        private String login;
        private String senha;
        public String getLogin() { return login; }
        public void setLogin(String login) { this.login = login; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
    }
}
