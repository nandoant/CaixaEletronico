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
        List<? extends ICedula> cedulasOrdenadas = new ArrayList<>(cedulas);
        cedulasOrdenadas.sort((a, b) -> Integer.compare(a.getValorCedula().getValor(), b.getValorCedula().getValor()));
        cedulasOrdenadas = cedulasOrdenadas.stream()
            .filter(cedula -> cedula.getQuantidade() > 0)
            .toList();
        Map<ValorCedula, Integer> combinacao = new HashMap<>();
        int valorRestante = valor;
        for (ICedula cedula : cedulasOrdenadas) {
            int valorNota = cedula.getValorCedula().getValor();
            int quantidadeMaxima = Math.min(cedula.getQuantidade(), valorRestante / valorNota);
            if (quantidadeMaxima > 0) {
                combinacao.put(cedula.getValorCedula(), quantidadeMaxima);
                valorRestante -= quantidadeMaxima * valorNota;
            }
        }
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
