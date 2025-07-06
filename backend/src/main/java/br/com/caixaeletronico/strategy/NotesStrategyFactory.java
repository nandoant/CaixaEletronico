package br.com.caixaeletronico.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotesStrategyFactory {
    
    @Autowired
    private List<NotesDispenseStrategy> strategies;
    
    public List<NotesDispenseStrategy> getAllStrategies() {
        return strategies;
    }
    
    public NotesDispenseStrategy getStrategy(String strategyName) {
        return strategies.stream()
            .filter(strategy -> strategy.getStrategyName().equals(strategyName))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Estratégia não encontrada: " + strategyName));
    }
}
