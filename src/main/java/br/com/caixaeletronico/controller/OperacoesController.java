package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.OperacoesControllerApi;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.service.CommandManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/operacoes")
public class OperacoesController implements OperacoesControllerApi {
    
    @Autowired
    private CommandManagerService commandManagerService;
    
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
            
            // Executar transferência
            commandManagerService.executarComando(
                TipoOperacao.TRANSFERENCIA,
                usuario,
                usuario.getEmail(),
                request.getContaOrigemId(),
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
