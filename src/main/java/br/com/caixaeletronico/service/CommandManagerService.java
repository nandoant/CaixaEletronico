package br.com.caixaeletronico.service;

import br.com.caixaeletronico.command.CommandFactory;
import br.com.caixaeletronico.command.OperacaoCommand;
import br.com.caixaeletronico.event.OperationCompletedEvent;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.OperationMemento;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.OperacaoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Stack;

@Service
@Transactional
public class CommandManagerService {
    
    @Autowired
    private CommandFactory commandFactory;
    
    @Autowired
    private OperacaoRepository operacaoRepository;
    
    @Autowired
    private br.com.caixaeletronico.repository.ContaRepository contaRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Pilha para controle de undo (simplificado - em produção seria mais sofisticado)
    private Stack<Long> undoStack = new Stack<>();
    
    public Operacao executarComando(TipoOperacao tipo, Usuario usuario, String emailUsuario, Object... parametros) {
        try {
            // Cria e executa comando
            OperacaoCommand command = commandFactory.criarCommand(tipo, usuario, parametros);
            OperationMemento memento = command.gerarMemento();
            
            command.executar();
            
            // Persiste operação
            Operacao operacao = criarOperacao(tipo, usuario, memento, parametros);
            operacao = operacaoRepository.save(operacao);
            
            // Adiciona à pilha de undo
            undoStack.push(operacao.getId());
            
            // Publica evento
            eventPublisher.publishEvent(new OperationCompletedEvent(this, operacao, emailUsuario));
            
            return operacao;
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao executar comando: " + e.getMessage(), e);
        }
    }
    
    public void desfazerUltimaOperacao(Usuario usuario) {
        if (undoStack.isEmpty()) {
            throw new RuntimeException("Nenhuma operação para desfazer");
        }
        
        Long operacaoId = undoStack.pop();
        Operacao operacaoOriginal = operacaoRepository.findById(operacaoId)
            .orElseThrow(() -> new RuntimeException("Operação não encontrada"));
        
        if (operacaoOriginal.getMementoJson() == null) {
            throw new RuntimeException("Operação não pode ser desfeita - memento não disponível");
        }
        
        try {
            // Deserializa memento
            OperationMemento memento = objectMapper.readValue(operacaoOriginal.getMementoJson(), OperationMemento.class);
            
            // Cria comando de desfazer
            OperacaoCommand command = criarCommandoDesfazer(operacaoOriginal, memento);
            command.desfazer();
            
            // Persiste operação de desfazer
            Operacao operacaoDesfazer = new Operacao();
            operacaoDesfazer.setTipo(TipoOperacao.DESFAZER);
            operacaoDesfazer.setValor(operacaoOriginal.getValor());
            operacaoDesfazer.setContaOrigem(operacaoOriginal.getContaOrigem());
            operacaoDesfazer.setContaDestino(operacaoOriginal.getContaDestino());
            operacaoDesfazer.setUsuarioResponsavel(usuario.getLogin());
            
            operacaoRepository.save(operacaoDesfazer);
            
            // Publica evento
            eventPublisher.publishEvent(new OperationCompletedEvent(this, operacaoDesfazer, usuario.getEmail()));
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao desfazer operação: " + e.getMessage(), e);
        }
    }
    
    private Operacao criarOperacao(TipoOperacao tipo, Usuario usuario, OperationMemento memento, Object... parametros) {
        Operacao operacao = new Operacao();
        operacao.setTipo(tipo);
        operacao.setUsuarioResponsavel(usuario.getLogin());
        
        // Serializa memento
        try {
            operacao.setMementoJson(objectMapper.writeValueAsString(memento));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao serializar memento", e);
        }
        
        // Define parâmetros específicos baseado no tipo
        switch (tipo) {
            case DEPOSITO:
            case SAQUE:
                if (parametros.length >= 2) {
                    Long contaId = (Long) parametros[0];
                    java.math.BigDecimal valor = (java.math.BigDecimal) parametros[1];
                    
                    // Busca e associa a conta
                    br.com.caixaeletronico.model.Conta conta = contaRepository.findById(contaId)
                        .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
                    
                    operacao.setValor(valor);
                    operacao.setContaOrigem(conta);
                }
                break;
            case TRANSFERENCIA:
                if (parametros.length >= 3) {
                    Long contaOrigemId = (Long) parametros[0];
                    Long contaDestinoId = (Long) parametros[1];
                    java.math.BigDecimal valor = (java.math.BigDecimal) parametros[2];
                    
                    // Busca e associa as contas
                    br.com.caixaeletronico.model.Conta contaOrigem = contaRepository.findById(contaOrigemId)
                        .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
                    br.com.caixaeletronico.model.Conta contaDestino = contaRepository.findById(contaDestinoId)
                        .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
                    
                    operacao.setValor(valor);
                    operacao.setContaOrigem(contaOrigem);
                    operacao.setContaDestino(contaDestino);
                }
                break;
            case PAGAMENTO_PARCELA:
                // Lógica específica para pagamento de parcela pode ser adicionada aqui
                break;
            case PAGAMENTO_IMEDIATO:
                // Lógica específica para pagamento imediato pode ser adicionada aqui
                break;
            case DESFAZER:
                // Lógica específica para desfazer pode ser adicionada aqui
                break;
        }
        
        return operacao;
    }
    
    private OperacaoCommand criarCommandoDesfazer(Operacao operacaoOriginal, OperationMemento memento) {
        // Aqui seria implementada a lógica específica para criar comando de desfazer
        // Por simplicidade, vamos retornar um comando básico
        return commandFactory.criarCommand(operacaoOriginal.getTipo(), 
            operacaoOriginal.getContaOrigem().getId(), 
            operacaoOriginal.getValor());
    }
}
