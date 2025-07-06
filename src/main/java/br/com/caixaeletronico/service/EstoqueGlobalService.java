package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.EstoqueGlobal;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.repository.EstoqueGlobalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EstoqueGlobalService {
    
    @Autowired
    private EstoqueGlobalRepository estoqueGlobalRepository;
    
    public List<EstoqueGlobal> obterEstoqueGlobal() {
        return estoqueGlobalRepository.findAllByOrderByValorCedulaDesc();
    }
    
    public EstoqueGlobal obterEstoquePorValor(ValorCedula valorCedula) {
        return estoqueGlobalRepository.findByValorCedula(valorCedula)
            .orElseThrow(() -> new RuntimeException("Estoque não encontrado para cédula " + valorCedula));
    }
    
    public void adicionarCedulas(ValorCedula valorCedula, int quantidade) {
        EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
            .orElse(new EstoqueGlobal(valorCedula, 0));
        
        estoque.adicionarQuantidade(quantidade);
        estoqueGlobalRepository.save(estoque);
    }
    
    public void removerCedulas(ValorCedula valorCedula, int quantidade) {
        EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
            .orElseThrow(() -> new RuntimeException("Estoque não encontrado para cédula " + valorCedula));
        
        if (estoque.getQuantidade() < quantidade) {
            throw new RuntimeException("Quantidade insuficiente no estoque");
        }
        
        estoque.removerQuantidade(quantidade);
        estoqueGlobalRepository.save(estoque);
    }
    
    public boolean verificarDisponibilidade(ValorCedula valorCedula, int quantidadeNecessaria) {
        EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
            .orElse(new EstoqueGlobal(valorCedula, 0));
        
        return estoque.getQuantidade() >= quantidadeNecessaria;
    }
    
    public int obterQuantidadeDisponivel(ValorCedula valorCedula) {
        EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
            .orElse(new EstoqueGlobal(valorCedula, 0));
        
        return estoque.getQuantidade();
    }
}
