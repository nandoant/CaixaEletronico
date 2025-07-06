package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.UndoControllerApi;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.service.CommandManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/operacoes/desfazer")
public class UndoController implements UndoControllerApi {
    
    @Autowired
    private CommandManagerService commandManagerService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> desfazerUltimaOperacao(Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            
            commandManagerService.desfazerUltimaOperacao(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Operação desfeita com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
