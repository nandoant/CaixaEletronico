package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.AuthControllerApi;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PerfilUsuario;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Usuário registrado com sucesso");
            response.put("userId", usuario.getId());
            response.put("login", usuario.getLogin());
            response.put("email", usuario.getEmail());
            response.put("perfil", usuario.getPerfil());
            
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
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("userId", usuario.getId());
            response.put("login", usuario.getLogin());
            response.put("email", usuario.getEmail());
            response.put("perfil", usuario.getPerfil());
            
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
            String jwt = token.substring(7); // Remove "Bearer "
            Usuario usuario = authenticationService.obterUsuarioDoToken(jwt)
                .orElseThrow(() -> new RuntimeException("Token inválido"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", usuario.getId());
            response.put("login", usuario.getLogin());
            response.put("email", usuario.getEmail());
            response.put("perfil", usuario.getPerfil());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<?> testeAutenticacao(Authentication authentication) {
        try {
            if (authentication == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication is null");
                return ResponseEntity.status(401).body(error);
            }
            
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Autenticação funcionando!");
            response.put("usuario", usuario.getLogin());
            response.put("perfil", usuario.getPerfil());
            response.put("authorities", authentication.getAuthorities());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/atualizar-conta")
    public ResponseEntity<?> atualizarConta(@RequestBody AtualizarContaRequest request, 
                                           Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Busca a conta do usuário
            Optional<Conta> contaOpt = contaRepository.findByUsuario(usuario);
            if (contaOpt.isEmpty()) {
                // Se não tem conta, cria uma nova
                Conta novaConta = new Conta();
                novaConta.setTitular(request.getTitular());
                novaConta.setSaldo(BigDecimal.ZERO);
                novaConta.setUsuario(usuario);
                contaRepository.save(novaConta);
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Conta criada com sucesso");
                response.put("titular", novaConta.getTitular());
                response.put("saldo", novaConta.getSaldo());
                
                return ResponseEntity.ok(response);
            } else {
                // Se já tem conta, atualiza o titular
                Conta conta = contaOpt.get();
                conta.setTitular(request.getTitular());
                contaRepository.save(conta);
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Conta atualizada com sucesso");
                response.put("titular", conta.getTitular());
                response.put("saldo", conta.getSaldo());
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // DTOs
    public static class RegistroRequest {
        private String login;
        private String email;
        private String senha;
        private PerfilUsuario perfil;
        
        // Getters and Setters
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
        
        // Getters and Setters
        public String getLogin() { return login; }
        public void setLogin(String login) { this.login = login; }
        
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
    }
    
    public static class AtualizarContaRequest {
        private String titular;
        
        public String getTitular() { return titular; }
        public void setTitular(String titular) { this.titular = titular; }
    }
}
