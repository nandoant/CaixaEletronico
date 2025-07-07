package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.OperacoesControllerApi;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.CommandManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/operacoes")
public class OperacoesController implements OperacoesControllerApi {
    
    @Autowired
    private CommandManagerService commandManagerService;
    
    @Autowired
    private ContaRepository contaRepository;
    
    @PostMapping("/deposito")
    public ResponseEntity<?> depositar(
            @RequestBody DepositoRequest request,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Converte mapa de cédulas
            Map<ValorCedula, Integer> cedulasDeposito = new HashMap<>();
            for (Map.Entry<String, Integer> entry : request.getCedulas().entrySet()) {
                ValorCedula valorCedula = ValorCedula.valueOf(entry.getKey());
                cedulasDeposito.put(valorCedula, entry.getValue());
            }
            
            // Executar depósito
            commandManagerService.executarComando(
                TipoOperacao.DEPOSITO,
                usuario,
                usuario.getEmail(),
                request.getContaId(),
                request.getValor(),
                cedulasDeposito
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Depósito realizado com sucesso");
            response.put("valor", request.getValor());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/transferencia")
    public ResponseEntity<?> transferir(
            @RequestBody TransferenciaRequest request,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            Long contaOrigemId = request.getContaOrigemId();
            
            // Para usuários não-admin, a conta origem deve ser uma das contas do usuário
            if (!usuario.getPerfil().equals(br.com.caixaeletronico.model.PerfilUsuario.ADMIN)) {
                // Se não foi especificada conta origem ou se a conta especificada não pertence ao usuário
                if (contaOrigemId == null) {
                    throw new RuntimeException("Conta origem é obrigatória");
                }
                // A validação de propriedade será feita no comando
            }
            
            // Executar transferência
            commandManagerService.executarComando(
                TipoOperacao.TRANSFERENCIA,
                usuario,
                usuario.getEmail(),
                contaOrigemId,
                request.getContaDestinoId(),
                request.getValor()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Transferência realizada com sucesso");
            response.put("valor", request.getValor());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/contas-origem")
    public ResponseEntity<?> listarContasOrigem(Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            List<Conta> contas;
            
            // Administradores podem usar qualquer conta como origem
            if (usuario.getPerfil().equals(br.com.caixaeletronico.model.PerfilUsuario.ADMIN)) {
                contas = contaRepository.findAll();
            } else {
                // Usuários normais só podem usar suas próprias contas
                contas = contaRepository.findByUsuario(usuario);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("usuario", usuario.getLogin());
            response.put("perfil", usuario.getPerfil());
            response.put("totalContas", contas.size());
            response.put("contas", contas.stream().map(conta -> {
                Map<String, Object> contaInfo = new HashMap<>();
                contaInfo.put("id", conta.getId());
                contaInfo.put("titular", conta.getTitular());
                contaInfo.put("saldo", conta.getSaldo());
                contaInfo.put("proprietario", conta.getUsuario().getLogin());
                return contaInfo;
            }).toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // DTOs
    public static class DepositoRequest {
        private Long contaId;
        private BigDecimal valor;
        private Map<String, Integer> cedulas;
        
        // Getters and Setters
        public Long getContaId() { return contaId; }
        public void setContaId(Long contaId) { this.contaId = contaId; }
        
        public BigDecimal getValor() { return valor; }
        public void setValor(BigDecimal valor) { this.valor = valor; }
        
        public Map<String, Integer> getCedulas() { return cedulas; }
        public void setCedulas(Map<String, Integer> cedulas) { this.cedulas = cedulas; }
    }
    
    public static class TransferenciaRequest {
        private Long contaOrigemId;
        private Long contaDestinoId;
        private BigDecimal valor;
        
        // Getters and Setters
        public Long getContaOrigemId() { return contaOrigemId; }
        public void setContaOrigemId(Long contaOrigemId) { this.contaOrigemId = contaOrigemId; }
        
        public Long getContaDestinoId() { return contaDestinoId; }
        public void setContaDestinoId(Long contaDestinoId) { this.contaDestinoId = contaDestinoId; }
        
        public BigDecimal getValor() { return valor; }
        public void setValor(BigDecimal valor) { this.valor = valor; }
    }
}
