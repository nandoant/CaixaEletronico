package br.com.caixaeletronico.strategy;

import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.SlotCedula;

import java.util.List;

public interface NotesDispenseStrategy {
    
    List<CombinacaoCedulas> generateCombinations(int valor, List<SlotCedula> slots);
    
    String getStrategyName();
}
