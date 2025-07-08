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
            System.out.println("✅ Email de notificação enviado com sucesso para: " + 
                             maskEmail(event.getEmailUsuario()));
        } catch (Exception e) {
            // Log detalhado do erro
            System.err.println("❌ Erro ao enviar email de notificação: " + e.getMessage());
            System.err.println("   Tipo do erro: " + e.getClass().getSimpleName());
            if (e.getCause() != null) {
                System.err.println("   Causa: " + e.getCause().getMessage());
            }
            System.err.println("   Email destinatário: " + maskEmail(event.getEmailUsuario()));
            e.printStackTrace();
        }
    }
    
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];
        
        if (username.length() <= 2) {
            return email;
        }
        
        String maskedUsername = username.substring(0, 2) + "***";
        return maskedUsername + "@" + domain;
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
