package br.com.caixaeletronico.command;

import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TransferenciaCommand implements OperacaoCommand {
    
    private final ContaRepository contaRepository;
    
    private final Long contaOrigemId;
    private final Long contaDestinoId;
    private final BigDecimal valor;
    private OperationMemento memento;
    
    public TransferenciaCommand(ContaRepository contaRepository, 
                               Long contaOrigemId, Long contaDestinoId, BigDecimal valor) {
        this.contaRepository = contaRepository;
        this.contaOrigemId = contaOrigemId;
        this.contaDestinoId = contaDestinoId;
        this.valor = valor;
    }
    
    @Override
    public void executar() {
        Conta contaOrigem = contaRepository.findByIdWithSlots(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        
        Conta contaDestino = contaRepository.findByIdWithSlots(contaDestinoId)
            .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
        
        // Verifica se há saldo suficiente
        if (contaOrigem.getSaldo().compareTo(valor) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }
        
        // Gera memento antes da operação
        memento = gerarMemento();
        
        // Executa transferência
        contaOrigem.setSaldo(contaOrigem.getSaldo().subtract(valor));
        contaDestino.setSaldo(contaDestino.getSaldo().add(valor));
        
        contaRepository.save(contaOrigem);
        contaRepository.save(contaDestino);
    }
    
    @Override
    public void desfazer() {
        if (memento == null) {
            throw new IllegalStateException("Memento não disponível para desfazer operação");
        }
        
        Conta contaOrigem = contaRepository.findByIdWithSlots(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        
        Conta contaDestino = contaRepository.findByIdWithSlots(contaDestinoId)
            .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
        
        // Restaura saldos
        BigDecimal saldoAnteriorOrigem = memento.getSaldosAntes().get(contaOrigemId);
        BigDecimal saldoAnteriorDestino = memento.getSaldosAntes().get(contaDestinoId);
        
        contaOrigem.setSaldo(saldoAnteriorOrigem);
        contaDestino.setSaldo(saldoAnteriorDestino);
        
        contaRepository.save(contaOrigem);
        contaRepository.save(contaDestino);
    }
    
    @Override
    public OperationMemento gerarMemento() {
        Conta contaOrigem = contaRepository.findByIdWithSlots(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        
        Conta contaDestino = contaRepository.findByIdWithSlots(contaDestinoId)
            .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
        
        Map<Long, BigDecimal> saldosAntes = new HashMap<>();
        saldosAntes.put(contaOrigemId, contaOrigem.getSaldo());
        saldosAntes.put(contaDestinoId, contaDestino.getSaldo());
        
        Map<Long, List<OperationMemento.SlotCedulaSnapshot>> slotsAntes = new HashMap<>();
        
        // Snapshots conta origem
        List<OperationMemento.SlotCedulaSnapshot> snapshotsOrigem = new ArrayList<>();
        for (SlotCedula slot : contaOrigem.getSlotsCedulas()) {
            snapshotsOrigem.add(new OperationMemento.SlotCedulaSnapshot(
                slot.getId(), slot.getValorCedula(), slot.getQuantidade()));
        }
        slotsAntes.put(contaOrigemId, snapshotsOrigem);
        
        // Snapshots conta destino
        List<OperationMemento.SlotCedulaSnapshot> snapshotsDestino = new ArrayList<>();
        for (SlotCedula slot : contaDestino.getSlotsCedulas()) {
            snapshotsDestino.add(new OperationMemento.SlotCedulaSnapshot(
                slot.getId(), slot.getValorCedula(), slot.getQuantidade()));
        }
        slotsAntes.put(contaDestinoId, snapshotsDestino);
        
        return new OperationMemento(saldosAntes, slotsAntes);
    }
}
