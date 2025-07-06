package br.com.caixaeletronico.event;

import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.TipoOperacao;
import freemarker.template.Configuration;
import freemarker.template.Template;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.io.StringWriter;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailNotificationService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    @Qualifier("freemarkerConfiguration")
    private Configuration freemarkerConfig;
    
    @EventListener
    @Async
    public void handleOperationCompleted(OperationCompletedEvent event) {
        try {
            enviarEmailNotificacao(event.getOperacao(), event.getEmailUsuario());
        } catch (Exception e) {
            // Log do erro - em produção usar um logger apropriado
            System.err.println("Erro ao enviar email de notificação: " + e.getMessage());
        }
    }
    
    private void enviarEmailNotificacao(Operacao operacao, String emailUsuario) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setTo(emailUsuario);
        helper.setSubject("Notificação de Operação - Caixa Eletrônico");
        helper.setFrom("noreply@caixaeletronico.com.br");
        
        String htmlContent = renderizarTemplate(operacao);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }
    
    private String renderizarTemplate(Operacao operacao) throws Exception {
        Template template = freemarkerConfig.getTemplate("operacao-notification.ftlh");
        
        Map<String, Object> model = new HashMap<>();
        model.put("operacao", operacao);
        model.put("tipoOperacao", getTipoOperacaoDescricao(operacao.getTipo()));
        model.put("dataHora", operacao.getDataHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
        model.put("valor", String.format("R$ %.2f", operacao.getValor()));
        
        StringWriter stringWriter = new StringWriter();
        template.process(model, stringWriter);
        
        return stringWriter.toString();
    }
    
    private String getTipoOperacaoDescricao(TipoOperacao tipo) {
        switch (tipo) {
            case DEPOSITO: return "Depósito";
            case SAQUE: return "Saque";
            case TRANSFERENCIA: return "Transferência";
            case PAGAMENTO_PARCELA: return "Pagamento de Parcela";
            case DESFAZER: return "Operação Desfeita";
            default: return "Operação";
        }
    }
}
