package br.com.caixaeletronico.event;
import br.com.caixaeletronico.model.Operacao;
import org.springframework.context.ApplicationEvent;
public class OperationCompletedEvent extends ApplicationEvent {
    private final Operacao operacao;
    private final String emailUsuario;
    public OperationCompletedEvent(Object source, Operacao operacao, String emailUsuario) {
        super(source);
        this.operacao = operacao;
        this.emailUsuario = emailUsuario;
    }
    public Operacao getOperacao() {
        return operacao;
    }
    public String getEmailUsuario() {
        return emailUsuario;
    }
}
