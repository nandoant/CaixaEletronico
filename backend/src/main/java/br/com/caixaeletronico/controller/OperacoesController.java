package br.com.caixaeletronico.controller;
import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.OperacoesControllerApi;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.CommandManagerService;
import br.com.caixaeletronico.util.ResponseUtil;
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
            Map<ValorCedula, Integer> cedulasDeposito = new HashMap<>();
            for (Map.Entry<String, Integer> entry : request.getCedulas().entrySet()) {
                ValorCedula valorCedula = ValorCedula.valueOf(entry.getKey());
                cedulasDeposito.put(valorCedula, entry.getValue());
            }
            commandManagerService.executarComando(
                TipoOperacao.DEPOSITO,
                usuario,
                usuario.getEmail(),
                request.getContaId(),
                request.getValor(),
                cedulasDeposito
            );
            Conta conta = contaRepository.findById(request.getContaId())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            Map<String, Object> dadosOperacao = new HashMap<>();
            dadosOperacao.put("operacao", Map.of(
                "tipo", "DEPOSITO",
                "valor", request.getValor(),
                "dataHora", java.time.LocalDateTime.now(),
                "status", "CONCLUIDA"
            ));
            dadosOperacao.put("novoSaldoDisponivel", true);
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoComConta(
                "Depósito realizado com sucesso", conta, false, dadosOperacao);
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
            commandManagerService.executarComando(
                TipoOperacao.TRANSFERENCIA,
                usuario,
                usuario.getEmail(),
                request.getContaOrigemId(),
                request.getContaDestinoId(),
                request.getValor()
            );
            Conta contaOrigem = contaRepository.findById(request.getContaOrigemId())
                .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
            Conta contaDestino = contaRepository.findById(request.getContaDestinoId())
                .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
            Map<String, Object> dadosOperacao = new HashMap<>();
            dadosOperacao.put("operacao", Map.of(
                "tipo", "TRANSFERENCIA",
                "valor", request.getValor(),
                "dataHora", java.time.LocalDateTime.now(),
                "status", "CONCLUIDA"
            ));
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoComDuasContas(
                "Transferência realizada com sucesso", contaOrigem, contaDestino, false, dadosOperacao);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    public static class DepositoRequest {
        private Long contaId;
        private BigDecimal valor;
        private Map<String, Integer> cedulas;
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
        public Long getContaOrigemId() { return contaOrigemId; }
        public void setContaOrigemId(Long contaOrigemId) { this.contaOrigemId = contaOrigemId; }
        public Long getContaDestinoId() { return contaDestinoId; }
        public void setContaDestinoId(Long contaDestinoId) { this.contaDestinoId = contaDestinoId; }
        public BigDecimal getValor() { return valor; }
        public void setValor(BigDecimal valor) { this.valor = valor; }
    }
}
