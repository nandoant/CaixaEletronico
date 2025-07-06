package br.com.caixaeletronico.strategy;

import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.ICedula;
import br.com.caixaeletronico.model.ValorCedula;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class IntermediateNotesStrategy implements NotesDispenseStrategy {
    
    @Override
    public List<CombinacaoCedulas> generateCombinations(int valor, List<? extends ICedula> cedulas) {
        List<CombinacaoCedulas> combinacoes = new ArrayList<>();
        
        // Filtra apenas cedulas com quantidade > 0
        List<? extends ICedula> cedulasDisponiveis = cedulas.stream()
            .filter(cedula -> cedula.getQuantidade() > 0)
            .toList();
        
        if (cedulasDisponiveis.isEmpty()) {
            return combinacoes;
        }
        
        // Estratégia balanceada: tenta usar notas intermediárias primeiro
        Map<ValorCedula, Integer> combinacao = new HashMap<>();
        
        // Ordena por valor e encontra a nota intermediária como ponto de partida
        List<? extends ICedula> cedulasOrdenadas = new ArrayList<>(cedulasDisponiveis);
        cedulasOrdenadas.sort((a, b) -> Integer.compare(a.getValorCedula().getValor(), b.getValorCedula().getValor()));
        
        int valorRestante = valor;
        
        // Começa do meio da lista (estratégia balanceada)
        int meioIndice = cedulasOrdenadas.size() / 2;
        
        // Primeiro, tenta usar notas do meio para cima
        for (int i = meioIndice; i < cedulasOrdenadas.size(); i++) {
            ICedula cedula = cedulasOrdenadas.get(i);
            int valorNota = cedula.getValorCedula().getValor();
            int quantidadeMaxima = Math.min(cedula.getQuantidade(), valorRestante / valorNota);
            
            if (quantidadeMaxima > 0) {
                combinacao.put(cedula.getValorCedula(), quantidadeMaxima);
                valorRestante -= quantidadeMaxima * valorNota;
            }
        }
        
        // Depois, completa com notas menores se necessário
        for (int i = meioIndice - 1; i >= 0 && valorRestante > 0; i--) {
            ICedula cedula = cedulasOrdenadas.get(i);
            int valorNota = cedula.getValorCedula().getValor();
            int quantidadeMaxima = Math.min(cedula.getQuantidade(), valorRestante / valorNota);
            
            if (quantidadeMaxima > 0) {
                combinacao.put(cedula.getValorCedula(), quantidadeMaxima);
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
