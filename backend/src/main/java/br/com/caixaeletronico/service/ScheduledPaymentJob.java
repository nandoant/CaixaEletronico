package br.com.caixaeletronico.service;

import br.com.caixaeletronico.command.CommandFactory;
import br.com.caixaeletronico.command.OperacaoCommand;
import br.com.caixaeletronico.model.PagamentoAgendado;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.repository.PagamentoAgendadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ScheduledPaymentJob {
    
    @Autowired
    private PaymentScheduleService paymentScheduleService;
    
    @Autowired
    private CommandFactory commandFactory;
    
    @Autowired
    private PagamentoAgendadoRepository pagamentoAgendadoRepository;
    
    @Scheduled(fixedRate = 3600000) // Executa a cada hora
    public void processarPagamentosVencidos() {
        try {
            List<PagamentoAgendado> pagamentosVencidos = paymentScheduleService.obterPagamentosVencidos();
            
            for (PagamentoAgendado pagamento : pagamentosVencidos) {
                try {
                    processarPagamento(pagamento);
                } catch (Exception e) {
                    // Log do erro - em produção usar um logger apropriado
                    System.err.println("Erro ao processar pagamento ID " + pagamento.getId() + ": " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            // Log do erro geral
            System.err.println("Erro no job de pagamentos agendados: " + e.getMessage());
        }
    }
    
    private void processarPagamento(PagamentoAgendado pagamento) {
        try {
            // Cria e executa comando de pagamento de parcela
            OperacaoCommand command = commandFactory.criarCommand(TipoOperacao.PAGAMENTO_PARCELA, 
                                                                pagamento.getId());
            command.executar();
            
            // Atualiza status do pagamento
            pagamento.processarParcela();
            pagamentoAgendadoRepository.save(pagamento);
            
            System.out.println("Pagamento processado com sucesso: ID " + pagamento.getId());
            
        } catch (Exception e) {
            System.err.println("Falha ao processar pagamento ID " + pagamento.getId() + ": " + e.getMessage());
            throw e;
        }
    }
    
    @Scheduled(cron = "0 0 1 * * ?") // Executa diariamente às 01:00
    public void limpezaPagamentosConcluidos() {
        try {
            // Em produção, poderia implementar lógica para arquivar pagamentos antigos
            System.out.println("Executando limpeza de pagamentos concluídos...");
            
        } catch (Exception e) {
            System.err.println("Erro na limpeza de pagamentos: " + e.getMessage());
        }
    }
}
