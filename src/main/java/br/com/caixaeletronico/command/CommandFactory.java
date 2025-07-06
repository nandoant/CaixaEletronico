package br.com.caixaeletronico.command;

import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.ValorCedula;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.PagamentoAgendadoRepository;
import br.com.caixaeletronico.repository.SlotCedulaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class CommandFactory {
    
    @Autowired
    private ContaRepository contaRepository;
    
    @Autowired
    private SlotCedulaRepository slotCedulaRepository;
    
    @Autowired
    private PagamentoAgendadoRepository pagamentoAgendadoRepository;
    
    public OperacaoCommand criarCommand(TipoOperacao tipo, Object... parametros) {
        switch (tipo) {
            case DEPOSITO:
                return criarDepositoCommand(parametros);
            case SAQUE:
                return criarSaqueCommand(parametros);
            case TRANSFERENCIA:
                return criarTransferenciaCommand(parametros);
            case PAGAMENTO_PARCELA:
                return criarPaymentInstallmentCommand(parametros);
            default:
                throw new IllegalArgumentException("Tipo de operação não suportado: " + tipo);
        }
    }
    
    private OperacaoCommand criarDepositoCommand(Object... parametros) {
        if (parametros.length < 3) {
            throw new IllegalArgumentException("Parâmetros insuficientes para criar comando de depósito");
        }
        
        Long contaId = (Long) parametros[0];
        BigDecimal valor = (BigDecimal) parametros[1];
        @SuppressWarnings("unchecked")
        Map<ValorCedula, Integer> cedulasDeposito = (Map<ValorCedula, Integer>) parametros[2];
        
        return new DepositoCommand(contaRepository, slotCedulaRepository, 
                                  contaId, valor, cedulasDeposito);
    }
    
    private OperacaoCommand criarSaqueCommand(Object... parametros) {
        if (parametros.length < 3) {
            throw new IllegalArgumentException("Parâmetros insuficientes para criar comando de saque");
        }
        
        Long contaId = (Long) parametros[0];
        BigDecimal valor = (BigDecimal) parametros[1];
        @SuppressWarnings("unchecked")
        Map<ValorCedula, Integer> cedulasSaque = (Map<ValorCedula, Integer>) parametros[2];
        
        return new SaqueCommand(contaRepository, slotCedulaRepository, 
                               contaId, valor, cedulasSaque);
    }
    
    private OperacaoCommand criarTransferenciaCommand(Object... parametros) {
        if (parametros.length < 3) {
            throw new IllegalArgumentException("Parâmetros insuficientes para criar comando de transferência");
        }
        
        Long contaOrigemId = (Long) parametros[0];
        Long contaDestinoId = (Long) parametros[1];
        BigDecimal valor = (BigDecimal) parametros[2];
        
        return new TransferenciaCommand(contaRepository, 
                                       contaOrigemId, contaDestinoId, valor);
    }
    
    private OperacaoCommand criarPaymentInstallmentCommand(Object... parametros) {
        if (parametros.length < 1) {
            throw new IllegalArgumentException("Parâmetros insuficientes para criar comando de pagamento de parcela");
        }
        
        Long pagamentoAgendadoId = (Long) parametros[0];
        
        return new PaymentInstallmentCommand(contaRepository, pagamentoAgendadoRepository, 
                                           pagamentoAgendadoId);
    }
}
