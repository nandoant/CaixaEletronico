package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.PagamentoControllerApi;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PagamentoAgendado;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.PaymentScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController implements PagamentoControllerApi {
    
    @Autowired
    private PaymentScheduleService paymentScheduleService;
    
    @Autowired
    private ContaRepository contaRepository;
    
    @PostMapping("/agendar")
    public ResponseEntity<?> agendarPagamento(
            @RequestBody PagamentoRequest request,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Verifica se a conta pertence ao usuário
            Conta conta = contaRepository.findById(request.getContaId())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            
            // Verifica se a conta pertence ao usuário
            if (!conta.getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Acesso negado: você não tem permissão para acessar esta conta");
            }
            
            PagamentoAgendado pagamento = paymentScheduleService.criarPagamentoAgendado(
                conta,
                request.getValorTotal(),
                request.getQuantidadeParcelas(),
                request.getPeriodicidadeDias(),
                request.getDataInicio(),
                request.isDebitarPrimeiraParcela()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Pagamento agendado com sucesso");
            response.put("id", pagamento.getId());
            response.put("valorTotal", pagamento.getValorTotal());
            response.put("valorParcela", pagamento.getValorParcela());
            response.put("quantidadeParcelas", pagamento.getQuantidadeParcelas());
            response.put("dataProximaExecucao", pagamento.getDataProximaExecucao());
            response.put("status", pagamento.getStatus());
            response.put("primeiraParcelaDebitada", request.isDebitarPrimeiraParcela());
            
            if (request.isDebitarPrimeiraParcela()) {
                response.put("valorDebitadoAgora", pagamento.getValorParcela());
                response.put("novoSaldo", conta.getSaldo());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> obterPagamento(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            PagamentoAgendado pagamento = paymentScheduleService.obterPagamentoPorId(id);
            
            // Verifica se o pagamento pertence ao usuário
            if (!pagamento.getContaOrigem().getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Pagamento não autorizado");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", pagamento.getId());
            response.put("valorTotal", pagamento.getValorTotal());
            response.put("valorParcela", pagamento.getValorParcela());
            response.put("quantidadeParcelas", pagamento.getQuantidadeParcelas());
            response.put("parcelasRestantes", pagamento.getParcelasRestantes());
            response.put("periodicidadeDias", pagamento.getPeriodicidadeDias());
            response.put("dataProximaExecucao", pagamento.getDataProximaExecucao());
            response.put("status", pagamento.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/conta/{contaId}")
    public ResponseEntity<?> listarPagamentosPorConta(
            @PathVariable Long contaId,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            Conta conta = contaRepository.findById(contaId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            
            // Verifica se a conta pertence ao usuário
            if (!conta.getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Acesso negado: você não tem permissão para acessar esta conta");
            }
            
            List<PagamentoAgendado> pagamentos = paymentScheduleService.obterTodosPagamentos(conta);
            
            Map<String, Object> response = new HashMap<>();
            response.put("contaId", conta.getId());
            response.put("pagamentos", pagamentos);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarPagamento(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            PagamentoAgendado pagamento = paymentScheduleService.obterPagamentoPorId(id);
            
            // Verifica se o pagamento pertence ao usuário
            if (!pagamento.getContaOrigem().getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Pagamento não autorizado");
            }
            
            paymentScheduleService.cancelarPagamento(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Pagamento cancelado com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // DTO
    public static class PagamentoRequest {
        private Long contaId;
        private BigDecimal valorTotal;
        private Integer quantidadeParcelas;
        private Integer periodicidadeDias;
        private boolean debitarPrimeiraParcela = false; // Default false para compatibilidade
        
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate dataInicio;
        
        // Getters and Setters
        public Long getContaId() { return contaId; }
        public void setContaId(Long contaId) { this.contaId = contaId; }
        
        public BigDecimal getValorTotal() { return valorTotal; }
        public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
        
        public Integer getQuantidadeParcelas() { return quantidadeParcelas; }
        public void setQuantidadeParcelas(Integer quantidadeParcelas) { this.quantidadeParcelas = quantidadeParcelas; }
        
        public Integer getPeriodicidadeDias() { return periodicidadeDias; }
        public void setPeriodicidadeDias(Integer periodicidadeDias) { this.periodicidadeDias = periodicidadeDias; }
        
        public LocalDate getDataInicio() { return dataInicio; }
        public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
        
        public boolean isDebitarPrimeiraParcela() { return debitarPrimeiraParcela; }
        public void setDebitarPrimeiraParcela(boolean debitarPrimeiraParcela) { this.debitarPrimeiraParcela = debitarPrimeiraParcela; }
    }
}
