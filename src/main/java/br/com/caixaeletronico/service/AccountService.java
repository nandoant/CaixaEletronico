package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.SlotCedula;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.SlotCedulaRepository;
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
    private SlotCedulaRepository slotCedulaRepository;
    
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
    
    public void adicionarCedulas(Long contaId, ValorCedula valorCedula, int quantidade) {
        Conta conta = contaRepository.findByIdWithSlots(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        SlotCedula slot = slotCedulaRepository.findByContaAndValorCedula(conta, valorCedula)
            .orElse(new SlotCedula(conta, valorCedula, 0));
        
        slot.adicionarQuantidade(quantidade);
        slotCedulaRepository.save(slot);
    }
    
    public void removerCedulas(Long contaId, ValorCedula valorCedula, int quantidade) {
        Conta conta = contaRepository.findByIdWithSlots(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        SlotCedula slot = slotCedulaRepository.findByContaAndValorCedula(conta, valorCedula)
            .orElseThrow(() -> new RuntimeException("Slot não encontrado"));
        
        slot.removerQuantidade(quantidade);
        slotCedulaRepository.save(slot);
    }
    
    public List<SlotCedula> obterSlotsCedulas(Long contaId) {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        return slotCedulaRepository.findByContaOrderByValorCedulaDesc(conta);
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
