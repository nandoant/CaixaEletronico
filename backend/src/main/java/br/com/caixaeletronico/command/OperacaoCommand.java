package br.com.caixaeletronico.command;
import br.com.caixaeletronico.model.OperationMemento;
public interface OperacaoCommand {
    void executar();
    void desfazer();
    OperationMemento gerarMemento();
}
