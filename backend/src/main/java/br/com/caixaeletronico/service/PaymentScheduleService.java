package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PagamentoAgendado;
import br.com.caixaeletronico.model.StatusAgendamento;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.PagamentoAgendadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PaymentScheduleService {
    
    @Autowired
    private PagamentoAgendadoRepository pagamentoAgendadoRepository;
    
    @Autowired
    private ContaRepository contaRepository;
    
    public PagamentoAgendado criarPagamentoAgendado(Conta conta, BigDecimal valorTotal, 
                                                   Integer quantidadeParcelas, Integer periodicidadeDias,
                                                   LocalDate dataInicio, boolean debitarPrimeiraParcela) {
        
        PagamentoAgendado pagamento = new PagamentoAgendado(conta, valorTotal, quantidadeParcelas, 
                                                           periodicidadeDias, dataInicio);
        
        if (debitarPrimeiraParcela) {
            // Valida saldo para primeira parcela
            BigDecimal valorParcela = pagamento.getValorParcela();
            if (conta.getSaldo().compareTo(valorParcela) < 0) {
                throw new RuntimeException("Saldo insuficiente para primeira parcela");
            }
            
            // Debita primeira parcela imediatamente
            conta.setSaldo(conta.getSaldo().subtract(valorParcela));
            
            // Atualiza controle do pagamento
            pagamento.setParcelasRestantes(quantidadeParcelas - 1);
            pagamento.setDataProximaExecucao(dataInicio.plusDays(periodicidadeDias));
            
            // Se só tinha 1 parcela, finaliza o pagamento
            if (quantidadeParcelas == 1) {
                pagamento.setStatus(StatusAgendamento.CONCLUIDO);
            }
            
            // Salva alterações na conta
            contaRepository.save(conta);
        }
        
        return pagamentoAgendadoRepository.save(pagamento);
    }
    
    // Método de compatibilidade - mantém funcionamento existente
    public PagamentoAgendado criarPagamentoAgendado(Conta conta, BigDecimal valorTotal, 
                                                   Integer quantidadeParcelas, Integer periodicidadeDias,
                                                   LocalDate dataInicio) {
        return criarPagamentoAgendado(conta, valorTotal, quantidadeParcelas, periodicidadeDias, dataInicio, false);
    }
    
    public List<PagamentoAgendado> obterPagamentosAtivos(Conta conta) {
        return pagamentoAgendadoRepository.findByContaOrigemAndStatus(conta, StatusAgendamento.ATIVO);
    }
    
    public List<PagamentoAgendado> obterPagamentosVencidos() {
        return pagamentoAgendadoRepository.findPagamentosVencidos(LocalDate.now());
    }
    
    public PagamentoAgendado obterPagamentoPorId(Long id) {
        return pagamentoAgendadoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pagamento agendado não encontrado"));
    }
    
    public void cancelarPagamento(Long id) {
        PagamentoAgendado pagamento = obterPagamentoPorId(id);
        pagamento.setStatus(StatusAgendamento.CANCELADO);
        pagamentoAgendadoRepository.save(pagamento);
    }
    
    public void processarParcela(Long id) {
        PagamentoAgendado pagamento = obterPagamentoPorId(id);
        pagamento.processarParcela();
        pagamentoAgendadoRepository.save(pagamento);
    }
    
    public List<PagamentoAgendado> obterTodosPagamentos(Conta conta) {
        return pagamentoAgendadoRepository.findByContaOrigem(conta);
    }
}
