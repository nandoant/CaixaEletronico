package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.SaqueControllerApi;
import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.CommandManagerService;
import br.com.caixaeletronico.service.SaqueOptionService;
import br.com.caixaeletronico.util.ResponseUtil;
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
    
    @Autowired
    private ContaRepository contaRepository;
    
    @GetMapping("/opcoes")
    public ResponseEntity<?> obterOpcoesSaque(
            @RequestParam Long contaId,
            @RequestParam int valor,
            Authentication authentication) {
        try {
            List<CombinacaoCedulas> opcoes = saqueOptionService.obterOpcoesRaques(contaId, valor);
            
            // Buscar conta para resposta padronizada
            Conta conta = contaRepository.findById(contaId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            
            Map<String, Object> dadosOpcoes = new HashMap<>();
            dadosOpcoes.put("valorSolicitado", valor);
            dadosOpcoes.put("opcoes", opcoes);
            dadosOpcoes.put("totalOpcoes", opcoes.size());
            dadosOpcoes.put("saldoSuficiente", true);
            
            // Não exibe saldo na resposta para proteger informações sensíveis
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoComConta(
                "Opções de saque calculadas com sucesso", conta, false, dadosOpcoes);
            
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
            
            // Buscar conta para resposta padronizada
            Conta conta = contaRepository.findById(request.getContaId())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            
            Map<String, Object> dadosOperacao = new HashMap<>();
            dadosOperacao.put("operacao", Map.of(
                "tipo", "SAQUE",
                "valor", request.getValor(),
                "dataHora", java.time.LocalDateTime.now(),
                "combinacaoEscolhida", combinacao.getDescricaoLegivel(),
                "status", "CONCLUIDA"
            ));
            
            // Não exibe saldo na resposta para proteger informações sensíveis
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoComConta(
                "Saque realizado com sucesso", conta, false, dadosOperacao);
            
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
