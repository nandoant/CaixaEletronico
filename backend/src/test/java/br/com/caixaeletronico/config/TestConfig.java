package br.com.caixaeletronico.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

/**
 * Configuração para testes unitários
 */
@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    public Clock testClock() {
        return Clock.fixed(
            Instant.parse("2025-07-08T10:00:00Z"), 
            ZoneOffset.UTC
        );
    }
}
