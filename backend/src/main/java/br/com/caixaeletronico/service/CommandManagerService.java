package br.com.caixaeletronico.service;

import br.com.caixaeletronico.command.CommandFactory;
import br.com.caixaeletronico.command.OperacaoCommand;
import br.com.caixaeletronico.event.OperationCompletedEvent;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.OperationMemento;
import br.com.caixaeletronico.model.PerfilUsuario;
import br.com.caixaeletronico.model.TipoOperacao;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.OperacaoRepository;
import br.com.caixaeletronico.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
    private br.com.caixaeletronico.repository.EstoqueGlobalRepository estoqueGlobalRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public Operacao executarComando(TipoOperacao tipo, Usuario usuario, String emailUsuario, Object... parametros) {
        try {
            // Cria e executa comando
            OperacaoCommand command = commandFactory.criarCommand(tipo, usuario, parametros);
            OperationMemento memento = command.gerarMemento();
            
            command.executar();
            
            // Persiste operação
            Operacao operacao = criarOperacao(tipo, usuario, memento, parametros);
            operacao = operacaoRepository.save(operacao);
            
            // Publica evento
            eventPublisher.publishEvent(new OperationCompletedEvent(this, operacao, emailUsuario));
            
            return operacao;
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao executar comando: " + e.getMessage(), e);
        }
    }
    
    public void desfazerOperacaoEspecifica(Long operacaoId, Long usuarioId, Usuario admin) {
        // Validar se o admin tem as permissões necessárias
        if (!admin.getPerfil().equals(PerfilUsuario.ADMIN)) {
            throw new RuntimeException("Apenas administradores podem desfazer operações específicas");
        }
        
        // Buscar o usuário alvo
        Usuario usuarioAlvo = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Buscar a operação específica
        Operacao operacaoOriginal = operacaoRepository.findByIdAndUsuarioResponsavelAndNaoDesfeita(
            operacaoId, usuarioAlvo.getLogin());
        
        if (operacaoOriginal == null) {
            throw new RuntimeException("Operação não encontrada ou já foi desfeita");
        }
        
        // Verificar se a operação pode ser desfeita
        if (operacaoOriginal.getMementoJson() == null) {
            throw new RuntimeException("Operação não pode ser desfeita - memento não disponível");
        }
        
        if (operacaoOriginal.getDesfeita()) {
            throw new RuntimeException("Operação já foi desfeita anteriormente");
        }
        
        try {
            // Deserializa memento
            OperationMemento memento = objectMapper.readValue(operacaoOriginal.getMementoJson(), OperationMemento.class);
            
            // Cria comando de desfazer
            OperacaoCommand command = criarCommandoDesfazer(operacaoOriginal, memento);
            command.desfazer();
            
            // Marcar a operação original como desfeita
            operacaoOriginal.setDesfeita(true);
            operacaoOriginal.setAdminResponsavelDesfazer(admin.getLogin());
            operacaoOriginal.setDataHoraDesfazer(LocalDateTime.now());
            operacaoRepository.save(operacaoOriginal);
            
            // Persiste operação de desfazer
            Operacao operacaoDesfazer = new Operacao();
            operacaoDesfazer.setTipo(TipoOperacao.DESFAZER);
            operacaoDesfazer.setValor(operacaoOriginal.getValor());
            operacaoDesfazer.setContaOrigem(operacaoOriginal.getContaOrigem());
            operacaoDesfazer.setContaDestino(operacaoOriginal.getContaDestino());
            operacaoDesfazer.setUsuarioResponsavel(admin.getLogin());
            
            operacaoRepository.save(operacaoDesfazer);
            
            // Publica evento
            eventPublisher.publishEvent(new OperationCompletedEvent(this, operacaoDesfazer, admin.getEmail()));
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao desfazer operação: " + e.getMessage(), e);
        }
    }
    
    public java.util.List<Operacao> listarOperacoesUsuario(Long usuarioId, Usuario admin) {
        // Validar se o admin tem as permissões necessárias
        if (!admin.getPerfil().equals(PerfilUsuario.ADMIN)) {
            throw new RuntimeException("Apenas administradores podem listar operações de outros usuários");
        }
        
        // Buscar o usuário alvo
        Usuario usuarioAlvo = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Log de debug
        System.out.println("DEBUG: Buscando operações para usuário: " + usuarioAlvo.getLogin() + " (ID: " + usuarioId + ")");
        
        // Buscar operações do usuário, incluindo apenas as não desfeitas
        List<Operacao> todasOperacoes = operacaoRepository.findByUsuarioResponsavelWithContasOrderByDataHoraDesc(usuarioAlvo.getLogin());
        
        System.out.println("DEBUG: Total de operações encontradas: " + todasOperacoes.size());
        
        // Filtra operações que ainda podem ser desfeitas (não desfeitas e com memento)
        List<Operacao> operacoesFiltradas = todasOperacoes.stream()
            .filter(op -> !Boolean.TRUE.equals(op.getDesfeita()) && op.getMementoJson() != null)
            .collect(java.util.stream.Collectors.toList());
            
        System.out.println("DEBUG: Operações que podem ser desfeitas: " + operacoesFiltradas.size());
        
        return operacoesFiltradas;
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
            case DESFAZER:
                // Lógica específica para desfazer pode ser adicionada aqui
                break;
        }
        
        return operacao;
    }
    
    private OperacaoCommand criarCommandoDesfazer(Operacao operacaoOriginal, OperationMemento memento) {
        // Para desfazer, precisamos restaurar o estado anterior usando o memento
        // Vamos criar um comando especial que restaura o estado
        return new OperacaoCommand() {
            @Override
            public void executar() {
                // Não implementado - usado apenas para desfazer
                throw new UnsupportedOperationException("Este comando é usado apenas para desfazer");
            }
            
            @Override
            public void desfazer() {
                // Restaurar saldos das contas
                memento.getSaldosAntes().forEach((contaId, saldoAnterior) -> {
                    br.com.caixaeletronico.model.Conta conta = contaRepository.findById(contaId)
                        .orElseThrow(() -> new RuntimeException("Conta não encontrada: " + contaId));
                    conta.setSaldo(saldoAnterior);
                    contaRepository.save(conta);
                });
                
                // Restaurar estoque global
                memento.getEstoquesAntes().forEach(estoqueSnapshot -> {
                    br.com.caixaeletronico.model.EstoqueGlobal estoque = estoqueGlobalRepository
                        .findByValorCedula(estoqueSnapshot.getValorCedula())
                        .orElseThrow(() -> new RuntimeException("Estoque não encontrado para cédula: " + estoqueSnapshot.getValorCedula()));
                    estoque.setQuantidade(estoqueSnapshot.getQuantidade());
                    estoqueGlobalRepository.save(estoque);
                });
            }
            
            @Override
            public OperationMemento gerarMemento() {
                // Não implementado para comando de desfazer
                return null;
            }
        };
    }
}
