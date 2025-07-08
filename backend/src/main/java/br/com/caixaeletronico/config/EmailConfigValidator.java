package br.com.caixaeletronico.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EmailConfigValidator {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailConfigValidator.class);
    
    @Value("${spring.mail.host}")
    private String mailHost;
    
    @Value("${spring.mail.port}")
    private int mailPort;
    
    @Value("${spring.mail.username}")
    private String mailUsername;
    
    @Value("${spring.mail.password}")
    private String mailPassword;
    
    @PostConstruct
    public void validateEmailConfiguration() {
        logger.info("Validando configurações de email...");
        
        boolean isValid = true;
        
        if (mailHost == null || mailHost.trim().isEmpty()) {
            logger.error("❌ MAIL_HOST não configurado");
            isValid = false;
        }
        
        if (mailPort <= 0 || mailPort > 65535) {
            logger.error("❌ MAIL_PORT inválido: {}", mailPort);
            isValid = false;
        }
        
        if (mailUsername == null || mailUsername.trim().isEmpty() || 
            mailUsername.contains("seu-email") || mailUsername.equals("seu-email@gmail.com")) {
            logger.warn("⚠️  MAIL_USERNAME parece não estar configurado corretamente: {}", mailUsername);
            isValid = false;
        }
        
        if (mailPassword == null || mailPassword.trim().isEmpty() || 
            mailPassword.contains("sua-senha") || mailPassword.equals("sua-senha-app")) {
            logger.warn("⚠️  MAIL_PASSWORD parece não estar configurado corretamente");
            isValid = false;
        }
        
        if (isValid) {
            logger.info("✅ Configurações de email válidas:");
            logger.info("   Host: {}", mailHost);
            logger.info("   Port: {}", mailPort);
            logger.info("   Username: {}", maskEmail(mailUsername));
        } else {
            logger.warn("⚠️  Algumas configurações de email podem estar incorretas.");
            logger.warn("   Verifique o arquivo .env e as variáveis de ambiente.");
            logger.warn("   As notificações por email podem não funcionar corretamente.");
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
}
