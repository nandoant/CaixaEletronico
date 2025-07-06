package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.CombinacaoCedulas;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.SlotCedula;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.SlotCedulaRepository;
import br.com.caixaeletronico.strategy.NotesDispenseStrategy;
import br.com.caixaeletronico.strategy.NotesStrategyFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SaqueOptionService {
    
    @Autowired
    private ContaRepository contaRepository;
    
    @Autowired
    private SlotCedulaRepository slotCedulaRepository;
    
    @Autowired
    private NotesStrategyFactory strategyFactory;
    
    // Cache simples em memória
    private Map<String, List<CombinacaoCedulas>> cache = new HashMap<>();
    private Map<String, Long> cacheTimestamps = new HashMap<>();
    private final long CACHE_TTL = 30000; // 30 segundos
    
    public List<CombinacaoCedulas> obterOpcoesRaques(Long contaId, int valor) {
        String cacheKey = contaId + "_" + valor;
        
        // Verifica cache
        if (isCacheValid(cacheKey)) {
            return cache.get(cacheKey);
        }
        
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        List<SlotCedula> slots = slotCedulaRepository.findByContaAndQuantidadeGreaterThan(conta, 0);
        
        List<CombinacaoCedulas> todasCombinacoes = new ArrayList<>();
        
        // Aplica todas as estratégias
        for (NotesDispenseStrategy strategy : strategyFactory.getAllStrategies()) {
            List<CombinacaoCedulas> combinacoes = strategy.generateCombinations(valor, slots);
            todasCombinacoes.addAll(combinacoes);
        }
        
        // Remove duplicatas e ordena
        List<CombinacaoCedulas> resultado = consolidarEOrdenar(todasCombinacoes);
        
        // Armazena no cache
        cache.put(cacheKey, resultado);
        cacheTimestamps.put(cacheKey, System.currentTimeMillis());
        
        return resultado;
    }
    
    private boolean isCacheValid(String cacheKey) {
        if (!cache.containsKey(cacheKey)) {
            return false;
        }
        
        Long timestamp = cacheTimestamps.get(cacheKey);
        if (timestamp == null) {
            return false;
        }
        
        return System.currentTimeMillis() - timestamp < CACHE_TTL;
    }
    
    private List<CombinacaoCedulas> consolidarEOrdenar(List<CombinacaoCedulas> combinacoes) {
        // Remove duplicatas baseado na descrição legível
        Map<String, CombinacaoCedulas> combinacoesUnicas = combinacoes.stream()
            .collect(Collectors.toMap(
                CombinacaoCedulas::getDescricaoLegivel,
                combinacao -> combinacao,
                (existing, replacement) -> existing
            ));
        
        // Ordena por quantidade total de notas (menor número de notas primeiro)
        return combinacoesUnicas.values().stream()
            .sorted(Comparator.comparingInt(CombinacaoCedulas::getQuantidadeTotalDeNotas))
            .collect(Collectors.toList());
    }
    
    public CombinacaoCedulas obterCombinacaoPorId(UUID idOpcao, Long contaId, int valor) {
        List<CombinacaoCedulas> opcoes = obterOpcoesRaques(contaId, valor);
        
        return opcoes.stream()
            .filter(combinacao -> combinacao.getIdOpcao().equals(idOpcao))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Opção de saque não encontrada"));
    }
    
    public void limparCache() {
        cache.clear();
        cacheTimestamps.clear();
    }
}
