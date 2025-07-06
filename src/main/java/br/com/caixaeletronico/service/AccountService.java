package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.EstoqueGlobal;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.EstoqueGlobalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class AccountService {
    
    @Autowired
    private ContaRepository contaRepository;
    
    @Autowired
    private EstoqueGlobalRepository estoqueGlobalRepository;
    
    public void creditarConta(Long contaId, BigDecimal valor) {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        conta.setSaldo(conta.getSaldo().add(valor));
        contaRepository.save(conta);
    }
    
    public void debitarConta(Long contaId, BigDecimal valor) {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        if (conta.getSaldo().compareTo(valor) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }
        
        conta.setSaldo(conta.getSaldo().subtract(valor));
        contaRepository.save(conta);
    }
    
    public void adicionarCedulas(ValorCedula valorCedula, int quantidade) {
        EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
            .orElse(new EstoqueGlobal(valorCedula, 0));
        
        estoque.adicionarQuantidade(quantidade);
        estoqueGlobalRepository.save(estoque);
    }
    
    public void removerCedulas(ValorCedula valorCedula, int quantidade) {
        EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
            .orElseThrow(() -> new RuntimeException("Estoque não encontrado"));
        
        estoque.removerQuantidade(quantidade);
        estoqueGlobalRepository.save(estoque);
    }
    
    public List<EstoqueGlobal> obterEstoqueGlobal() {
        return estoqueGlobalRepository.findAllByOrderByValorCedulaDesc();
    }
    
    public BigDecimal obterSaldo(Long contaId) {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        return conta.getSaldo();
    }
    
    public boolean verificarSaldoSuficiente(Long contaId, BigDecimal valor) {
        return obterSaldo(contaId).compareTo(valor) >= 0;
    }
}
