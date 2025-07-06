package br.com.caixaeletronico.controller;

import br.com.caixaeletronico.controller.api.EstoqueGlobalControllerApi;
import br.com.caixaeletronico.model.EstoqueGlobal;
import br.com.caixaeletronico.service.EstoqueGlobalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/estoque")
public class EstoqueGlobalController implements EstoqueGlobalControllerApi {
    
    @Autowired
    private EstoqueGlobalService estoqueGlobalService;
    
    @GetMapping("/cedulas")
    @Override
    public ResponseEntity<?> consultarEstoqueGlobal() {
        try {
            List<EstoqueGlobal> estoque = estoqueGlobalService.obterEstoqueGlobal();
            
            Map<String, Object> response = new HashMap<>();
            response.put("estoque", estoque);
            response.put("totalCedulas", estoque.stream().mapToInt(EstoqueGlobal::getQuantidade).sum());
            
            // Calcula valor total em dinheiro
            int valorTotal = estoque.stream()
                .mapToInt(e -> e.getValorCedula().getValor() * e.getQuantidade())
                .sum();
            response.put("valorTotalDisponivel", valorTotal);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
