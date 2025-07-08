package br.com.caixaeletronico.command;
import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.ContaRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
public class TransferenciaCommand implements OperacaoCommand {
    private final ContaRepository contaRepository;
    private final Long contaOrigemId;
    private final Long contaDestinoId;
    private final BigDecimal valor;
    private final Usuario usuarioLogado;
    private OperationMemento memento;
    public TransferenciaCommand(ContaRepository contaRepository, 
                               Long contaOrigemId, Long contaDestinoId, BigDecimal valor) {
        this.contaRepository = contaRepository;
        this.contaOrigemId = contaOrigemId;
        this.contaDestinoId = contaDestinoId;
        this.valor = valor;
        this.usuarioLogado = null;
    }
    public TransferenciaCommand(ContaRepository contaRepository, 
                               Long contaOrigemId, Long contaDestinoId, BigDecimal valor, Usuario usuarioLogado) {
        this.contaRepository = contaRepository;
        this.contaOrigemId = contaOrigemId;
        this.contaDestinoId = contaDestinoId;
        this.valor = valor;
        this.usuarioLogado = usuarioLogado;
    }
    @Override
    public void executar() {
        Conta contaOrigem = contaRepository.findById(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        Conta contaDestino = contaRepository.findById(contaDestinoId)
            .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
        if (usuarioLogado != null && 
            !contaOrigem.getUsuario().getId().equals(usuarioLogado.getId()) && 
            !PerfilUsuario.ADMIN.equals(usuarioLogado.getPerfil())) {
            throw new RuntimeException("Você não tem permissão para transferir desta conta");
        }
        if (contaOrigem.getSaldo().compareTo(valor) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }
        memento = gerarMemento();
        contaOrigem.setSaldo(contaOrigem.getSaldo().subtract(valor));
        contaDestino.setSaldo(contaDestino.getSaldo().add(valor));
        contaRepository.save(contaOrigem);
        contaRepository.save(contaDestino);
    }
    @Override
    public void desfazer() {
        if (memento == null) {
            throw new IllegalStateException("Memento não disponível para desfazer operação");
        }
        Conta contaOrigem = contaRepository.findById(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        Conta contaDestino = contaRepository.findById(contaDestinoId)
            .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
        BigDecimal saldoAnteriorOrigem = memento.getSaldosAntes().get(contaOrigemId);
        BigDecimal saldoAnteriorDestino = memento.getSaldosAntes().get(contaDestinoId);
        contaOrigem.setSaldo(saldoAnteriorOrigem);
        contaDestino.setSaldo(saldoAnteriorDestino);
        contaRepository.save(contaOrigem);
        contaRepository.save(contaDestino);
    }
    @Override
    public OperationMemento gerarMemento() {
        Conta contaOrigem = contaRepository.findById(contaOrigemId)
            .orElseThrow(() -> new RuntimeException("Conta origem não encontrada"));
        Conta contaDestino = contaRepository.findById(contaDestinoId)
            .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
        Map<Long, BigDecimal> saldosAntes = new HashMap<>();
        saldosAntes.put(contaOrigemId, contaOrigem.getSaldo());
        saldosAntes.put(contaDestinoId, contaDestino.getSaldo());
        List<OperationMemento.EstoqueGlobalSnapshot> estoquesAntes = new ArrayList<>();
        return new OperationMemento(saldosAntes, estoquesAntes);
    }
}
