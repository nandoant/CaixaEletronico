package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.PagamentoImediatoControllerApi;
import br.com.caixaeletronico.model.TipoPagamento;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.service.ImmediatePaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoImediatoController implements PagamentoImediatoControllerApi {
    
    @Autowired
    private ImmediatePaymentService immediatePaymentService;
    
    @PostMapping("/imediato")
    public ResponseEntity<?> realizarPagamentoImediato(
            @RequestBody PagamentoImediatoRequest request,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            immediatePaymentService.realizarPagamentoImediato(
                request.getContaOrigemId(),
                request.getContaDestinoId(),
                request.getValor(),
                request.getDescricao(),
                request.getTipo(),
                usuario
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Pagamento realizado com sucesso");
            response.put("valor", request.getValor());
            response.put("tipo", request.getTipo().getDescricao());
            
            if (request.getTipo() == TipoPagamento.TRANSFERENCIA) {
                response.put("tipoOperacao", "Transferência entre contas");
            } else {
                response.put("tipoOperacao", "Pagamento - " + request.getTipo().getDescricao());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // DTO
    public static class PagamentoImediatoRequest {
        private Long contaOrigemId;
        private Long contaDestinoId; // Opcional - apenas para transferências
        private BigDecimal valor;
        private String descricao;
        private TipoPagamento tipo;
        
        // Getters and Setters
        public Long getContaOrigemId() { return contaOrigemId; }
        public void setContaOrigemId(Long contaOrigemId) { this.contaOrigemId = contaOrigemId; }
        
        public Long getContaDestinoId() { return contaDestinoId; }
        public void setContaDestinoId(Long contaDestinoId) { this.contaDestinoId = contaDestinoId; }
        
        public BigDecimal getValor() { return valor; }
        public void setValor(BigDecimal valor) { this.valor = valor; }
        
        public String getDescricao() { return descricao; }
        public void setDescricao(String descricao) { this.descricao = descricao; }
        
        public TipoPagamento getTipo() { return tipo; }
        public void setTipo(TipoPagamento tipo) { this.tipo = tipo; }
    }
}
