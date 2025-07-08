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
import br.com.caixaeletronico.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
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
            Conta conta;
            if (PerfilUsuario.ADMIN.equals(usuario.getPerfil())) {
                conta = contaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            } else {
                conta = contaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
                if (!conta.getUsuario().getId().equals(usuario.getId())) {
                    throw new RuntimeException("Acesso negado: você não tem permissão para acessar esta conta");
                }
            }
            List<Operacao> operacoes;
            if (dataInicio != null && dataFim != null) {
                LocalDateTime inicio = parseDateTime(dataInicio, true);
                LocalDateTime fim = parseDateTime(dataFim, false);
                operacoes = extractService.obterExtratoPorPeriodo(conta, inicio, fim);
            } else {
                operacoes = extractService.obterUltimasOperacoes(conta, limite);
            }
            List<OperacaoDto> operacoesDtos = operacoes.stream()
                .map(operacao -> new OperacaoDto(
                    operacao.getId(),
                    operacao.getTipo(),
                    operacao.getDataHora(),
                    operacao.getValor(),
                    operacao.getUsuarioResponsavel()
                ))
                .collect(Collectors.toList());
            Map<String, Object> dadosExtrato = new HashMap<>();
            dadosExtrato.put("operacoes", operacoesDtos);
            dadosExtrato.put("totalOperacoes", operacoesDtos.size());
            if (dataInicio != null && dataFim != null) {
                Map<String, Object> periodo = new HashMap<>();
                periodo.put("dataInicio", parseDateTime(dataInicio, true));
                periodo.put("dataFim", parseDateTime(dataFim, false));
                dadosExtrato.put("periodo", periodo);
            }
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoComConta(
                "Extrato obtido com sucesso", conta, true, dadosExtrato);
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
            Conta conta;
            if (PerfilUsuario.ADMIN.equals(usuario.getPerfil())) {
                conta = contaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            } else {
                conta = contaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
                if (!conta.getUsuario().getId().equals(usuario.getId())) {
                    throw new RuntimeException("Acesso negado: você não tem permissão para acessar esta conta");
                }
            }
            Map<String, Object> dadosSaldo = new HashMap<>();
            dadosSaldo.put("dataConsulta", java.time.LocalDateTime.now());
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoComConta(
                "Saldo consultado com sucesso", conta, true, dadosSaldo);
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
            List<Conta> contas;
            if (PerfilUsuario.ADMIN.equals(usuario.getPerfil())) {
                contas = contaRepository.findAll();
            } else {
                Optional<Conta> contaOpt = contaRepository.findByUsuario(usuario);
                contas = contaOpt.map(List::of).orElse(List.of());
            }
            Map<String, Object> dadosContas = new HashMap<>();
            dadosContas.put("usuario", usuario.getLogin());
            dadosContas.put("perfil", usuario.getPerfil());
            dadosContas.put("totalContas", contas.size());
            dadosContas.put("contas", contas.stream().map(conta -> {
                return ResponseUtil.criarContaInfoComSaldo(conta);
            }).toList());
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Contas listadas com sucesso", dadosContas);
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
            if (!PerfilUsuario.ADMIN.equals(usuario.getPerfil())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Acesso negado: apenas administradores podem listar todas as contas");
                return ResponseEntity.status(403).body(error);
            }
            List<Conta> contas = contaRepository.findAll();
            Map<String, Object> dadosTodasContas = new HashMap<>();
            dadosTodasContas.put("usuarioSolicitante", usuario.getLogin());
            dadosTodasContas.put("perfil", usuario.getPerfil());
            dadosTodasContas.put("totalContas", contas.size());
            dadosTodasContas.put("contas", contas.stream().map(conta -> {
                return ResponseUtil.criarContaInfoComSaldo(conta);
            }).toList());
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Todas as contas listadas com sucesso", dadosTodasContas);
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
            return LocalDateTime.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e1) {
            try {
                LocalDate date = LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
                return startOfDay ? date.atStartOfDay() : date.atTime(23, 59, 59);
            } catch (DateTimeParseException e2) {
                try {
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
