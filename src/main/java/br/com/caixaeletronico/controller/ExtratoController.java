package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.ExtratoControllerApi;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.ExtractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contas")
public class ExtratoController implements ExtratoControllerApi {
    
    @Autowired
    private ExtractService extractService;
    
    @Autowired
    private ContaRepository contaRepository;
    
    @GetMapping("/{id}/extrato")
    public ResponseEntity<?> obterExtrato(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false, defaultValue = "50") int limite,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Verifica se a conta pertence ao usuário (ou se é admin)
            Conta conta = contaRepository.findByIdAndUsuario(id, usuario)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada ou não autorizada"));
            
            List<Operacao> operacoes;
            
            if (dataInicio != null && dataFim != null) {
                operacoes = extractService.obterExtratoPorPeriodo(conta, dataInicio, dataFim);
            } else {
                operacoes = extractService.obterUltimasOperacoes(conta, limite);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("contaId", conta.getId());
            response.put("titular", conta.getTitular());
            response.put("saldoAtual", conta.getSaldo());
            response.put("operacoes", operacoes);
            response.put("totalOperacoes", operacoes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}/saldo")
    public ResponseEntity<?> obterSaldo(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Verifica se a conta pertence ao usuário (ou se é admin)
            Conta conta = contaRepository.findByIdAndUsuario(id, usuario)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada ou não autorizada"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("contaId", conta.getId());
            response.put("titular", conta.getTitular());
            response.put("saldo", conta.getSaldo());
            response.put("dataConsulta", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/minhas-contas")
    public ResponseEntity<?> listarMinhasContas(Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            List<Conta> contas = contaRepository.findByUsuario(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("usuario", usuario.getLogin());
            response.put("contas", contas.stream().map(conta -> {
                Map<String, Object> contaInfo = new HashMap<>();
                contaInfo.put("id", conta.getId());
                contaInfo.put("titular", conta.getTitular());
                contaInfo.put("saldo", conta.getSaldo());
                return contaInfo;
            }).toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
