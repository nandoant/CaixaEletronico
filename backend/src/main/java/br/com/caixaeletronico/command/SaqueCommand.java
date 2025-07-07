package br.com.caixaeletronico.command;

import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.EstoqueGlobalRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SaqueCommand implements OperacaoCommand {
    
    private final ContaRepository contaRepository;
    private final EstoqueGlobalRepository estoqueGlobalRepository;
    
    private final Long contaId;
    private final BigDecimal valor;
    private final Map<ValorCedula, Integer> cedulasSaque;
    private OperationMemento memento;
    
    public SaqueCommand(ContaRepository contaRepository, EstoqueGlobalRepository estoqueGlobalRepository, 
                       Long contaId, BigDecimal valor, Map<ValorCedula, Integer> cedulasSaque) {
        this.contaRepository = contaRepository;
        this.estoqueGlobalRepository = estoqueGlobalRepository;
        this.contaId = contaId;
        this.valor = valor;
        this.cedulasSaque = cedulasSaque;
    }
    
    public SaqueCommand(ContaRepository contaRepository, EstoqueGlobalRepository estoqueGlobalRepository, 
                       Long contaId, BigDecimal valor, Map<ValorCedula, Integer> cedulasSaque, Usuario usuarioLogado) {
        this.contaRepository = contaRepository;
        this.estoqueGlobalRepository = estoqueGlobalRepository;
        this.contaId = contaId;
        this.valor = valor;
        this.cedulasSaque = cedulasSaque;
        // Ignoramos o usuarioLogado pois agora permitimos saques de qualquer conta
    }
    
    @Override
    public void executar() {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        // Removida a validação de propriedade - agora permite saque de qualquer conta
        
        // Verifica se há saldo suficiente
        if (conta.getSaldo().compareTo(valor) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }
        
        // Gera memento antes da operação
        memento = gerarMemento();
        
        // Verifica se há cédulas suficientes no estoque global
        for (Map.Entry<ValorCedula, Integer> entry : cedulasSaque.entrySet()) {
            ValorCedula valorCedula = entry.getKey();
            Integer quantidadeNecessaria = entry.getValue();
            
            EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
                .orElseThrow(() -> new RuntimeException("Estoque não encontrado para cédula " + valorCedula));
            
            if (estoque.getQuantidade() < quantidadeNecessaria) {
                throw new RuntimeException("Cédulas insuficientes de R$" + valorCedula.getValor());
            }
        }
        
        // Atualiza saldo
        conta.setSaldo(conta.getSaldo().subtract(valor));
        
        // Atualiza estoque global de cédulas
        for (Map.Entry<ValorCedula, Integer> entry : cedulasSaque.entrySet()) {
            ValorCedula valorCedula = entry.getKey();
            Integer quantidade = entry.getValue();
            
            EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
                .orElseThrow(() -> new RuntimeException("Estoque não encontrado"));
            
            estoque.removerQuantidade(quantidade);
            estoqueGlobalRepository.save(estoque);
        }
        
        contaRepository.save(conta);
    }
    
    @Override
    public void desfazer() {
        if (memento == null) {
            throw new IllegalStateException("Memento não disponível para desfazer operação");
        }
        
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        // Restaura saldo
        BigDecimal saldoAnterior = memento.getSaldosAntes().get(contaId);
        conta.setSaldo(saldoAnterior);
        
        // Restaura estoque global
        List<OperationMemento.EstoqueGlobalSnapshot> estoquesAnteriores = memento.getEstoquesAntes();
        for (OperationMemento.EstoqueGlobalSnapshot snapshot : estoquesAnteriores) {
            EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(snapshot.getValorCedula())
                .orElseThrow(() -> new RuntimeException("Estoque não encontrado"));
            estoque.setQuantidade(snapshot.getQuantidade());
            estoqueGlobalRepository.save(estoque);
        }
        
        contaRepository.save(conta);
    }
    
    @Override
    public OperationMemento gerarMemento() {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        
        Map<Long, BigDecimal> saldosAntes = new HashMap<>();
        saldosAntes.put(contaId, conta.getSaldo());
        
        List<OperationMemento.EstoqueGlobalSnapshot> estoquesAntes = new ArrayList<>();
        List<EstoqueGlobal> estoques = estoqueGlobalRepository.findAll();
        
        for (EstoqueGlobal estoque : estoques) {
            estoquesAntes.add(new OperationMemento.EstoqueGlobalSnapshot(
                estoque.getValorCedula(), estoque.getQuantidade()));
        }
        
        return new OperationMemento(saldosAntes, estoquesAntes);
    }
}
