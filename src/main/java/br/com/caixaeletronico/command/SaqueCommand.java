package br.com.caixaeletronico.command;

import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.SlotCedulaRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SaqueCommand implements OperacaoCommand {
    
    private final ContaRepository contaRepository;
    private final SlotCedulaRepository slotCedulaRepository;
    
    private final Long contaId;
    private final BigDecimal valor;
    private final Map<ValorCedula, Integer> cedulasSaque;
    private OperationMemento memento;
    
    public SaqueCommand(ContaRepository contaRepository, SlotCedulaRepository slotCedulaRepository, 
                       Long contaId, BigDecimal valor, Map<ValorCedula, Integer> cedulasSaque) {
        this.contaRepository = contaRepository;
        this.slotCedulaRepository = slotCedulaRepository;
        this.contaId = contaId;
        this.valor = valor;
        this.cedulasSaque = cedulasSaque;
    }
    
    @Override
    public void executar() {
        Conta conta = contaRepository.findByIdWithSlots(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        // Verifica se há saldo suficiente
        if (conta.getSaldo().compareTo(valor) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }
        
        // Gera memento antes da operação
        memento = gerarMemento();
        
        // Verifica se há cédulas suficientes
        for (Map.Entry<ValorCedula, Integer> entry : cedulasSaque.entrySet()) {
            ValorCedula valorCedula = entry.getKey();
            Integer quantidadeNecessaria = entry.getValue();
            
            SlotCedula slot = slotCedulaRepository.findByContaAndValorCedula(conta, valorCedula)
                .orElseThrow(() -> new RuntimeException("Slot não encontrado para cédula " + valorCedula));
            
            if (slot.getQuantidade() < quantidadeNecessaria) {
                throw new RuntimeException("Cédulas insuficientes de R$" + valorCedula.getValor());
            }
        }
        
        // Atualiza saldo
        conta.setSaldo(conta.getSaldo().subtract(valor));
        
        // Atualiza slots de cédulas
        for (Map.Entry<ValorCedula, Integer> entry : cedulasSaque.entrySet()) {
            ValorCedula valorCedula = entry.getKey();
            Integer quantidade = entry.getValue();
            
            SlotCedula slot = slotCedulaRepository.findByContaAndValorCedula(conta, valorCedula)
                .orElseThrow(() -> new RuntimeException("Slot não encontrado"));
            
            slot.removerQuantidade(quantidade);
            slotCedulaRepository.save(slot);
        }
        
        contaRepository.save(conta);
    }
    
    @Override
    public void desfazer() {
        if (memento == null) {
            throw new IllegalStateException("Memento não disponível para desfazer operação");
        }
        
        Conta conta = contaRepository.findByIdWithSlots(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        // Restaura saldo
        BigDecimal saldoAnterior = memento.getSaldosAntes().get(contaId);
        conta.setSaldo(saldoAnterior);
        
        // Restaura slots
        List<OperationMemento.SlotCedulaSnapshot> slotsAnteriores = memento.getSlotsAntes().get(contaId);
        for (OperationMemento.SlotCedulaSnapshot snapshot : slotsAnteriores) {
            SlotCedula slot = slotCedulaRepository.findById(snapshot.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot não encontrado"));
            slot.setQuantidade(snapshot.getQuantidade());
            slotCedulaRepository.save(slot);
        }
        
        contaRepository.save(conta);
    }
    
    @Override
    public OperationMemento gerarMemento() {
        Conta conta = contaRepository.findByIdWithSlots(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        Map<Long, BigDecimal> saldosAntes = new HashMap<>();
        saldosAntes.put(contaId, conta.getSaldo());
        
        Map<Long, List<OperationMemento.SlotCedulaSnapshot>> slotsAntes = new HashMap<>();
        List<OperationMemento.SlotCedulaSnapshot> snapshots = new ArrayList<>();
        
        for (SlotCedula slot : conta.getSlotsCedulas()) {
            snapshots.add(new OperationMemento.SlotCedulaSnapshot(
                slot.getId(), slot.getValorCedula(), slot.getQuantidade()));
        }
        
        slotsAntes.put(contaId, snapshots);
        
        return new OperationMemento(saldosAntes, slotsAntes);
    }
}
