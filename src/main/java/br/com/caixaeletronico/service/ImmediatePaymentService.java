package br.com.caixaeletronico.service;

import br.com.caixaeletronico.command.CommandFactory;
import br.com.caixaeletronico.command.OperacaoCommand;
import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.OperacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class ImmediatePaymentService {
    
    @Autowired
    private ContaRepository contaRepository;
    
    @Autowired
    private OperacaoRepository operacaoRepository;
    
    @Autowired
    private CommandFactory commandFactory;
    
    public void realizarPagamentoImediato(Long contaOrigemId, Long contaDestinoId, 
                                        BigDecimal valor, String descricao, 
                                        TipoPagamento tipo, Usuario usuario) {
        
        // Validações
        validarPagamento(contaOrigemId, valor, usuario);
        
        // Cria e executa o comando
        OperacaoCommand command = commandFactory.criarCommand(TipoOperacao.PAGAMENTO_IMEDIATO,
            contaOrigemId, contaDestinoId, valor, descricao, tipo
        );
        
        command.executar();
        
        // Registra a operação no histórico
        registrarOperacao(contaOrigemId, contaDestinoId, valor, descricao, tipo, usuario);
    }
    
    private void validarPagamento(Long contaOrigemId, BigDecimal valor, Usuario usuario) {
        Conta contaOrigem = contaRepository.findById(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        
        // Verifica se a conta pertence ao usuário
        if (!contaOrigem.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Conta não autorizada para este usuário");
        }
        
        // Verifica se o valor é válido
        if (valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Valor deve ser maior que zero");
        }
        
        // Verifica saldo
        if (contaOrigem.getSaldo().compareTo(valor) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }
    }
    
    private void registrarOperacao(Long contaOrigemId, Long contaDestinoId, 
                                 BigDecimal valor, String descricao, 
                                 TipoPagamento tipo, Usuario usuario) {
        
        Operacao operacao = new Operacao();
        operacao.setTipo(getTipoOperacao(tipo));
        operacao.setValor(valor);
        operacao.setDataHora(LocalDateTime.now());
        operacao.setUsuarioResponsavel(usuario.getLogin());
        
        operacaoRepository.save(operacao);
    }
    
    private TipoOperacao getTipoOperacao(TipoPagamento tipoPagamento) {
        return switch (tipoPagamento) {
            case TRANSFERENCIA -> TipoOperacao.TRANSFERENCIA;
            case BOLETO, PIX, PAGAMENTO_GERAL -> TipoOperacao.PAGAMENTO_IMEDIATO;
        };
    }
}
