package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.SaqueControllerApi;
import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.service.CommandManagerService;
import br.com.caixaeletronico.service.SaqueOptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/operacoes/saque")
public class SaqueController implements SaqueControllerApi {
    
    @Autowired
    private SaqueOptionService saqueOptionService;
    
    @Autowired
    private CommandManagerService commandManagerService;
    
    @GetMapping("/opcoes")
    public ResponseEntity<?> obterOpcoesSaque(
            @RequestParam Long contaId,
            @RequestParam int valor,
            Authentication authentication) {
        try {
            List<CombinacaoCedulas> opcoes = saqueOptionService.obterOpcoesRaques(contaId, valor);
            
            Map<String, Object> response = new HashMap<>();
            response.put("opcoes", opcoes);
            response.put("contaId", contaId);
            response.put("valor", valor);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping
    public ResponseEntity<?> confirmarSaque(
            @RequestBody SaqueRequest request,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Obter combinação selecionada
            CombinacaoCedulas combinacao = saqueOptionService.obterCombinacaoPorId(
                request.getIdOpcao(), request.getContaId(), request.getValor());
            
            // Executar saque
            commandManagerService.executarComando(
                TipoOperacao.SAQUE,
                usuario,
                usuario.getEmail(),
                request.getContaId(),
                BigDecimal.valueOf(request.getValor()),
                combinacao.getMapaCedulas()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Saque realizado com sucesso");
            response.put("valor", request.getValor());
            response.put("combinacao", combinacao.getDescricaoLegivel());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // DTO
    public static class SaqueRequest {
        private Long contaId;
        private int valor;
        private UUID idOpcao;
        
        // Getters and Setters
        public Long getContaId() { return contaId; }
        public void setContaId(Long contaId) { this.contaId = contaId; }
        
        public int getValor() { return valor; }
        public void setValor(int valor) { this.valor = valor; }
        
        public UUID getIdOpcao() { return idOpcao; }
        public void setIdOpcao(UUID idOpcao) { this.idOpcao = idOpcao; }
    }
}
