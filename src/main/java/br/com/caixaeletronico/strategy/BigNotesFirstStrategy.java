package br.com.caixaeletronico.strategy;

import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.SlotCedula;
import br.com.caixaeletronico.model.ValorCedula;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class BigNotesFirstStrategy implements NotesDispenseStrategy {
    
    @Override
    public List<CombinacaoCedulas> generateCombinations(int valor, List<SlotCedula> slots) {
        List<CombinacaoCedulas> combinacoes = new ArrayList<>();
        
        // Ordena slots por valor decrescente
        List<SlotCedula> slotsOrdenados = new ArrayList<>(slots);
        slotsOrdenados.sort((a, b) -> Integer.compare(b.getValorCedula().getValor(), a.getValorCedula().getValor()));
        
        // Filtra apenas slots com quantidade > 0
        slotsOrdenados = slotsOrdenados.stream()
            .filter(slot -> slot.getQuantidade() > 0)
            .toList();
        
        Map<ValorCedula, Integer> combinacao = new HashMap<>();
        int valorRestante = valor;
        
        // Algoritmo guloso - sempre pega a maior nota possível
        for (SlotCedula slot : slotsOrdenados) {
            int valorNota = slot.getValorCedula().getValor();
            int quantidadeMaxima = Math.min(slot.getQuantidade(), valorRestante / valorNota);
            
            if (quantidadeMaxima > 0) {
                combinacao.put(slot.getValorCedula(), quantidadeMaxima);
                valorRestante -= quantidadeMaxima * valorNota;
            }
        }
        
        // Se conseguiu formar o valor exato, adiciona à lista
        if (valorRestante == 0) {
            combinacoes.add(new CombinacaoCedulas(combinacao));
        }
        
        return combinacoes;
    }
    
    @Override
    public String getStrategyName() {
        return "Notas Maiores Primeiro";
    }
}
