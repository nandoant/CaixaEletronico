package br.com.caixaeletronico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {
    
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "API funcionando!");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/cors")
    public ResponseEntity<?> testCors() {
        Map<String, String> response = new HashMap<>();
        response.put("cors", "OK");
        response.put("message", "CORS funcionando!");
        return ResponseEntity.ok(response);
    }
}
