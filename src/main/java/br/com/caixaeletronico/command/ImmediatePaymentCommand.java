package br.com.caixaeletronico.command;

import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ImmediatePaymentCommand implements OperacaoCommand {
    
    private final ContaRepository contaRepository;
    private final Long contaOrigemId;
    private final Long contaDestinoId;
    private final BigDecimal valor;
    private final String descricao;
    private final TipoPagamento tipo;
    private OperationMemento memento;
    
    public ImmediatePaymentCommand(ContaRepository contaRepository, 
                                 Long contaOrigemId, 
                                 Long contaDestinoId,
                                 BigDecimal valor,
                                 String descricao,
                                 TipoPagamento tipo) {
        this.contaRepository = contaRepository;
        this.contaOrigemId = contaOrigemId;
        this.contaDestinoId = contaDestinoId;
        this.valor = valor;
        this.descricao = descricao;
        this.tipo = tipo;
    }
    
    @Override
    public void executar() {
        Conta contaOrigem = contaRepository.findById(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        
        // Verifica se há saldo suficiente
        if (contaOrigem.getSaldo().compareTo(valor) < 0) {
            throw new RuntimeException("Saldo insuficiente para realizar o pagamento");
        }
        
        // Gera memento antes da operação
        memento = gerarMemento();
        
        // Executa o débito
        contaOrigem.setSaldo(contaOrigem.getSaldo().subtract(valor));
        
        // Se for transferência, credita na conta destino
        if (tipo == TipoPagamento.TRANSFERENCIA && contaDestinoId != null) {
            Conta contaDestino = contaRepository.findById(contaDestinoId)
                .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
            
            contaDestino.setSaldo(contaDestino.getSaldo().add(valor));
            contaRepository.save(contaDestino);
        }
        
        contaRepository.save(contaOrigem);
    }
    
    @Override
    public void desfazer() {
        if (memento == null) {
            throw new IllegalStateException("Memento não disponível para desfazer operação");
        }
        
        Conta contaOrigem = contaRepository.findById(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        
        // Restaura saldo da conta origem
        BigDecimal saldoAnteriorOrigem = memento.getSaldosAntes().get(contaOrigemId);
        contaOrigem.setSaldo(saldoAnteriorOrigem);
        
        // Se foi transferência, restaura saldo da conta destino
        if (tipo == TipoPagamento.TRANSFERENCIA && contaDestinoId != null) {
            Conta contaDestino = contaRepository.findById(contaDestinoId)
                .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
            
            BigDecimal saldoAnteriorDestino = memento.getSaldosAntes().get(contaDestinoId);
            contaDestino.setSaldo(saldoAnteriorDestino);
            contaRepository.save(contaDestino);
        }
        
        contaRepository.save(contaOrigem);
    }
    
    @Override
    public OperationMemento gerarMemento() {
        Conta contaOrigem = contaRepository.findById(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        
        Map<Long, BigDecimal> saldosAntes = new HashMap<>();
        saldosAntes.put(contaOrigemId, contaOrigem.getSaldo());
        
        // Se for transferência, salva saldo da conta destino também
        if (tipo == TipoPagamento.TRANSFERENCIA && contaDestinoId != null) {
            Conta contaDestino = contaRepository.findById(contaDestinoId)
                .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
            saldosAntes.put(contaDestinoId, contaDestino.getSaldo());
        }
        
        // Para pagamentos, não precisamos de snapshot do estoque global
        List<OperationMemento.EstoqueGlobalSnapshot> estoquesAntes = new ArrayList<>();
        
        return new OperationMemento(saldosAntes, estoquesAntes);
    }
}
