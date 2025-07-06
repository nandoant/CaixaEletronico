package br.com.caixaeletronico.strategy;

import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.SlotCedula;
import br.com.caixaeletronico.model.ValorCedula;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class IntermediateNotesStrategy implements NotesDispenseStrategy {
    
    @Override
    public List<CombinacaoCedulas> generateCombinations(int valor, List<SlotCedula> slots) {
        List<CombinacaoCedulas> combinacoes = new ArrayList<>();
        
        // Filtra apenas slots com quantidade > 0
        List<SlotCedula> slotsDisponiveis = slots.stream()
            .filter(slot -> slot.getQuantidade() > 0)
            .toList();
        
        if (slotsDisponiveis.isEmpty()) {
            return combinacoes;
        }
        
        // Estratégia balanceada: tenta usar notas intermediárias primeiro
        Map<ValorCedula, Integer> combinacao = new HashMap<>();
        
        // Ordena por valor e encontra a nota intermediária como ponto de partida
        List<SlotCedula> slotsOrdenados = new ArrayList<>(slotsDisponiveis);
        slotsOrdenados.sort((a, b) -> Integer.compare(a.getValorCedula().getValor(), b.getValorCedula().getValor()));
        
        int valorRestante = valor;
        
        // Começa do meio da lista (estratégia balanceada)
        int meioIndice = slotsOrdenados.size() / 2;
        
        // Primeiro, tenta usar notas do meio para cima
        for (int i = meioIndice; i < slotsOrdenados.size(); i++) {
            SlotCedula slot = slotsOrdenados.get(i);
            int valorNota = slot.getValorCedula().getValor();
            int quantidadeMaxima = Math.min(slot.getQuantidade(), valorRestante / valorNota);
            
            if (quantidadeMaxima > 0) {
                combinacao.put(slot.getValorCedula(), quantidadeMaxima);
                valorRestante -= quantidadeMaxima * valorNota;
            }
        }
        
        // Depois, completa com notas menores se necessário
        for (int i = meioIndice - 1; i >= 0 && valorRestante > 0; i--) {
            SlotCedula slot = slotsOrdenados.get(i);
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
        return "Estratégia Balanceada";
    }
}
