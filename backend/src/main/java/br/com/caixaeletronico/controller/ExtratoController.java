package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.ExtratoControllerApi;
import br.com.caixaeletronico.dto.OperacaoDto;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.model.PerfilUsuario;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.ExtractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(required = false, defaultValue = "50") int limite,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Verifica se a conta pertence ao usuário ou se é admin
            Conta conta;
            if (PerfilUsuario.ADMIN.equals(usuario.getPerfil())) {
                // Admin pode acessar qualquer conta
                conta = contaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            } else {
                // Usuário comum só pode acessar suas próprias contas
                conta = contaRepository.findByIdAndUsuario(id, usuario)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada ou não autorizada"));
            }
            
            List<Operacao> operacoes;
            
            if (dataInicio != null && dataFim != null) {
                // Converte strings para LocalDateTime
                LocalDateTime inicio = parseDateTime(dataInicio, true); // true = início do dia
                LocalDateTime fim = parseDateTime(dataFim, false); // false = fim do dia
                operacoes = extractService.obterExtratoPorPeriodo(conta, inicio, fim);
            } else {
                operacoes = extractService.obterUltimasOperacoes(conta, limite);
            }
            
            // Converte operações para DTOs para evitar problemas de serialização com proxies do Hibernate
            List<OperacaoDto> operacoesDtos = operacoes.stream()
                .map(operacao -> new OperacaoDto(
                    operacao.getId(),
                    operacao.getTipo(),
                    operacao.getDataHora(),
                    operacao.getValor(),
                    operacao.getUsuarioResponsavel()
                ))
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("contaId", conta.getId());
            response.put("titular", conta.getTitular());
            response.put("saldoAtual", conta.getSaldo());
            response.put("operacoes", operacoesDtos);
            response.put("totalOperacoes", operacoesDtos.size());
            
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
            
            // Verifica se a conta pertence ao usuário ou se é admin
            Conta conta;
            if (PerfilUsuario.ADMIN.equals(usuario.getPerfil())) {
                // Admin pode acessar qualquer conta
                conta = contaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            } else {
                // Usuário comum só pode acessar suas próprias contas
                conta = contaRepository.findByIdAndUsuario(id, usuario)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada ou não autorizada"));
            }
            
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
            
            // Lista apenas as contas do usuário logado
            List<Conta> contas = contaRepository.findByUsuario(usuario);
            
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

    @GetMapping("/todas-contas")
    public ResponseEntity<?> listarTodasContas(Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            // Removida a restrição de admin - agora qualquer usuário pode listar todas as contas
            // para realizar transações entre qualquer conta
            
            List<Conta> contas = contaRepository.findAll();
            
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
    
    private LocalDateTime parseDateTime(String dateString, boolean startOfDay) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Tenta primeiro como LocalDateTime (formato ISO: 2025-06-01T00:00:00)
            return LocalDateTime.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e1) {
            try {
                // Tenta como LocalDate (formato: 2025-06-01) e converte para LocalDateTime
                LocalDate date = LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
                return startOfDay ? date.atStartOfDay() : date.atTime(23, 59, 59);
            } catch (DateTimeParseException e2) {
                try {
                    // Tenta formato brasileiro: dd/MM/yyyy
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    LocalDate date = LocalDate.parse(dateString, formatter);
                    return startOfDay ? date.atStartOfDay() : date.atTime(23, 59, 59);
                } catch (DateTimeParseException e3) {
                    throw new RuntimeException("Formato de data inválido. Use: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss ou dd/MM/yyyy");
                }
            }
        }
    }
}
