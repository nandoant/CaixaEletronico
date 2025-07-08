package br.com.caixaeletronico.command;
import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.repository.EstoqueGlobalRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
public class DepositoCommand implements OperacaoCommand {
    private final ContaRepository contaRepository;
    private final EstoqueGlobalRepository estoqueGlobalRepository;
    private final Long contaId;
    private final BigDecimal valor;
    private final Map<ValorCedula, Integer> cedulasDeposito;
    private final Usuario usuarioLogado;
    private OperationMemento memento;
    public DepositoCommand(ContaRepository contaRepository, EstoqueGlobalRepository estoqueGlobalRepository, 
                          Long contaId, BigDecimal valor, 
                          Map<ValorCedula, Integer> cedulasDeposito) {
        this.contaRepository = contaRepository;
        this.estoqueGlobalRepository = estoqueGlobalRepository;
        this.contaId = contaId;
        this.valor = valor;
        this.cedulasDeposito = cedulasDeposito;
        this.usuarioLogado = null;
    }
    public DepositoCommand(ContaRepository contaRepository, EstoqueGlobalRepository estoqueGlobalRepository, 
                          Long contaId, BigDecimal valor, 
                          Map<ValorCedula, Integer> cedulasDeposito, Usuario usuarioLogado) {
        this.contaRepository = contaRepository;
        this.estoqueGlobalRepository = estoqueGlobalRepository;
        this.contaId = contaId;
        this.valor = valor;
        this.cedulasDeposito = cedulasDeposito;
        this.usuarioLogado = usuarioLogado;
    }
    @Override
    public void executar() {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        if (usuarioLogado != null && 
            !conta.getUsuario().getId().equals(usuarioLogado.getId()) && 
            !PerfilUsuario.ADMIN.equals(usuarioLogado.getPerfil())) {
            throw new RuntimeException("Você não tem permissão para depositar nesta conta");
        }
        memento = gerarMemento();
        conta.setSaldo(conta.getSaldo().add(valor));
        for (Map.Entry<ValorCedula, Integer> entry : cedulasDeposito.entrySet()) {
            ValorCedula valorCedula = entry.getKey();
            Integer quantidade = entry.getValue();
            EstoqueGlobal estoque = estoqueGlobalRepository.findByValorCedula(valorCedula)
                .orElse(new EstoqueGlobal(valorCedula, 0));
            estoque.adicionarQuantidade(quantidade);
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
        BigDecimal saldoAnterior = memento.getSaldosAntes().get(contaId);
        conta.setSaldo(saldoAnterior);
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
