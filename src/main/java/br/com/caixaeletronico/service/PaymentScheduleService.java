package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PagamentoAgendado;
import br.com.caixaeletronico.model.StatusAgendamento;
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
    
    public PagamentoAgendado criarPagamentoAgendado(Conta conta, BigDecimal valorTotal, 
                                                   Integer quantidadeParcelas, Integer periodicidadeDias,
                                                   LocalDate dataInicio) {
        PagamentoAgendado pagamento = new PagamentoAgendado(conta, valorTotal, quantidadeParcelas, 
                                                           periodicidadeDias, dataInicio);
        
        return pagamentoAgendadoRepository.save(pagamento);
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
