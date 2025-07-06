package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.UndoControllerApi;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.service.CommandManagerService;
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
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Operação " + operacaoId + " do usuário " + usuarioId + " desfeita com sucesso");
            response.put("operacaoId", operacaoId);
            response.put("usuarioId", usuarioId);
            response.put("adminResponsavel", admin.getLogin());
            
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
            
            Map<String, Object> response = new HashMap<>();
            response.put("usuarioId", usuarioId);
            response.put("operacoes", operacoes);
            response.put("total", operacoes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
