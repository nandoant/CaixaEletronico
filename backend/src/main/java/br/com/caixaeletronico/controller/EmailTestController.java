package br.com.caixaeletronico.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class EmailTestController {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @PostMapping("/email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email é obrigatório");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(email);
            helper.setSubject("🧪 Teste de Email - Caixa Eletrônico");
            helper.setFrom("noreply@caixaeletronico.com.br");
            
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Teste de Email</title>
                </head>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #28a745;">✅ Teste de Email Realizado com Sucesso!</h2>
                        <p>Se você está recebendo este email, significa que as configurações de SMTP estão funcionando corretamente.</p>
                        <hr>
                        <p><strong>Sistema:</strong> Caixa Eletrônico</p>
                        <p><strong>Data/Hora:</strong> %s</p>
                        <p><strong>Destinatário:</strong> %s</p>
                        <hr>
                        <p style="color: #6c757d; font-size: 12px;">Esta é uma mensagem de teste automática.</p>
                    </div>
                </body>
                </html>
                """.formatted(java.time.LocalDateTime.now().toString(), email);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email de teste enviado com sucesso para: " + email
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "errorType", e.getClass().getSimpleName()
            ));
        }
    }
}
