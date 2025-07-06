package br.com.caixaeletronico.command;

import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.PagamentoAgendadoRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PaymentInstallmentCommand implements OperacaoCommand {
    
    private final ContaRepository contaRepository;
    private final PagamentoAgendadoRepository pagamentoAgendadoRepository;
    
    private final Long pagamentoAgendadoId;
    private OperationMemento memento;
    
    public PaymentInstallmentCommand(ContaRepository contaRepository, 
                                   PagamentoAgendadoRepository pagamentoAgendadoRepository,
                                   Long pagamentoAgendadoId) {
        this.contaRepository = contaRepository;
        this.pagamentoAgendadoRepository = pagamentoAgendadoRepository;
        this.pagamentoAgendadoId = pagamentoAgendadoId;
    }
    
    @Override
    public void executar() {
        PagamentoAgendado pagamento = pagamentoAgendadoRepository.findById(pagamentoAgendadoId)
            .orElseThrow(() -> new RuntimeException("Pagamento agendado não encontrado"));
        
        if (pagamento.getStatus() != StatusAgendamento.ATIVO) {
            throw new RuntimeException("Pagamento não está ativo");
        }
        
        Conta conta = contaRepository.findById(pagamento.getContaOrigem().getId())
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        BigDecimal valorParcela = pagamento.getValorParcela();
        
        // Verifica se há saldo suficiente
        if (conta.getSaldo().compareTo(valorParcela) < 0) {
            throw new RuntimeException("Saldo insuficiente para pagamento da parcela");
        }
        
        // Gera memento antes da operação
        memento = gerarMemento();
        
        // Executa pagamento
        conta.setSaldo(conta.getSaldo().subtract(valorParcela));
        pagamento.processarParcela();
        
        contaRepository.save(conta);
        pagamentoAgendadoRepository.save(pagamento);
    }
    
    @Override
    public void desfazer() {
        if (memento == null) {
            throw new IllegalStateException("Memento não disponível para desfazer operação");
        }
        
        PagamentoAgendado pagamento = pagamentoAgendadoRepository.findById(pagamentoAgendadoId)
            .orElseThrow(() -> new RuntimeException("Pagamento agendado não encontrado"));
        
        Conta conta = contaRepository.findById(pagamento.getContaOrigem().getId())
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        // Restaura saldo
        BigDecimal saldoAnterior = memento.getSaldosAntes().get(conta.getId());
        conta.setSaldo(saldoAnterior);
        
        // Restaura estado do pagamento (simplificado - em produção seria mais complexo)
        pagamento.setParcelasRestantes(pagamento.getParcelasRestantes() + 1);
        pagamento.setDataProximaExecucao(pagamento.getDataProximaExecucao().minusDays(pagamento.getPeriodicidadeDias()));
        
        if (pagamento.getParcelasRestantes() > 0) {
            pagamento.setStatus(StatusAgendamento.ATIVO);
        }
        
        contaRepository.save(conta);
        pagamentoAgendadoRepository.save(pagamento);
    }
    
    @Override
    public OperationMemento gerarMemento() {
        PagamentoAgendado pagamento = pagamentoAgendadoRepository.findById(pagamentoAgendadoId)
            .orElseThrow(() -> new RuntimeException("Pagamento agendado não encontrado"));
        
        Conta conta = contaRepository.findById(pagamento.getContaOrigem().getId())
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        Map<Long, BigDecimal> saldosAntes = new HashMap<>();
        saldosAntes.put(conta.getId(), conta.getSaldo());
        
        // Para pagamentos, não precisamos de snapshot do estoque global
        List<OperationMemento.EstoqueGlobalSnapshot> estoquesAntes = new ArrayList<>();
        
        return new OperationMemento(saldosAntes, estoquesAntes);
    }
}
