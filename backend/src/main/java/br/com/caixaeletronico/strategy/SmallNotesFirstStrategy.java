package br.com.caixaeletronico.strategy;

import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.ICedula;
import br.com.caixaeletronico.model.ValorCedula;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SmallNotesFirstStrategy implements NotesDispenseStrategy {
    
    @Override
    public List<CombinacaoCedulas> generateCombinations(int valor, List<? extends ICedula> cedulas) {
        List<CombinacaoCedulas> combinacoes = new ArrayList<>();
        
        // Ordena cedulas por valor crescente
        List<? extends ICedula> cedulasOrdenadas = new ArrayList<>(cedulas);
        cedulasOrdenadas.sort((a, b) -> Integer.compare(a.getValorCedula().getValor(), b.getValorCedula().getValor()));
        
        // Filtra apenas cedulas com quantidade > 0
        cedulasOrdenadas = cedulasOrdenadas.stream()
            .filter(cedula -> cedula.getQuantidade() > 0)
            .toList();
        
        Map<ValorCedula, Integer> combinacao = new HashMap<>();
        int valorRestante = valor;
        
        // Algoritmo que prioriza notas menores
        for (ICedula cedula : cedulasOrdenadas) {
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
        return "Notas Menores Primeiro";
    }
}
