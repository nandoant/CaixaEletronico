package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.UndoControllerApi;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.service.CommandManagerService;
import br.com.caixaeletronico.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/operacoes/desfazer")
public class UndoController implements UndoControllerApi {
    
    @Autowired
    private CommandManagerService commandManagerService;
    
    @PostMapping("/{operacaoId}/usuario/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> desfazerOperacaoEspecifica(
            @PathVariable Long operacaoId,
            @PathVariable Long usuarioId,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario admin = principal.getUsuario();
            
            commandManagerService.desfazerOperacaoEspecifica(operacaoId, usuarioId, admin);
            
            Map<String, Object> dadosEstorno = new HashMap<>();
            dadosEstorno.put("operacaoEstornada", Map.of(
                "id", operacaoId,
                "usuarioId", usuarioId,
                "dataEstorno", java.time.LocalDateTime.now(),
                "status", "ESTORNADA"
            ));
            dadosEstorno.put("adminResponsavel", admin.getLogin());
            dadosEstorno.put("motivoEstorno", "Solicitação de estorno por administrador");
            
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Operação desfeita com sucesso", dadosEstorno);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/usuario/{usuarioId}/operacoes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listarOperacoesUsuario(
            @PathVariable Long usuarioId,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario admin = principal.getUsuario();
            
            List<Operacao> operacoes = commandManagerService.listarOperacoesUsuario(usuarioId, admin);
            
            // Converte operações para DTOs para evitar problemas de serialização
            List<Map<String, Object>> operacoesDto = operacoes.stream()
                .map(op -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", op.getId());
                    dto.put("tipo", op.getTipo());
                    dto.put("dataHora", op.getDataHora());
                    dto.put("valor", op.getValor());
                    dto.put("usuarioResponsavel", op.getUsuarioResponsavel());
                    dto.put("desfeita", op.getDesfeita());
                    
                    // Informações das contas (sem lazy loading)
                    if (op.getContaOrigem() != null) {
                        dto.put("contaOrigem", Map.of(
                            "id", op.getContaOrigem().getId(),
                            "numeroConta", op.getContaOrigem().getNumeroConta()
                        ));
                    }
                    if (op.getContaDestino() != null) {
                        dto.put("contaDestino", Map.of(
                            "id", op.getContaDestino().getId(),
                            "numeroConta", op.getContaDestino().getNumeroConta()
                        ));
                    }
                    
                    dto.put("podeDesfazer", !Boolean.TRUE.equals(op.getDesfeita()) && op.getMementoJson() != null);
                    
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> dadosOperacoes = new HashMap<>();
            dadosOperacoes.put("usuarioConsultado", usuarioId);
            dadosOperacoes.put("adminSolicitante", admin.getLogin());
            dadosOperacoes.put("operacoes", operacoesDto);
            dadosOperacoes.put("totalOperacoes", operacoesDto.size());
            
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoSimples(
                "Operações do usuário listadas com sucesso", dadosOperacoes);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
