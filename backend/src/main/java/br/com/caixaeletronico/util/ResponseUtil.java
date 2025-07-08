package br.com.caixaeletronico.util;

import br.com.caixaeletronico.dto.ContaInfoDto;
import br.com.caixaeletronico.dto.ContaBasicaDto;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PerfilUsuario;
import br.com.caixaeletronico.model.Usuario;

import java.util.HashMap;
import java.util.Map;

public class ResponseUtil {
    
    /**
     * Cria ContaBasicaDto sem saldo (para endpoints de autenticação)
     */
    public static ContaBasicaDto criarContaBasica(Conta conta) {
        return new ContaBasicaDto(
            conta.getId(),
            conta.getNumeroConta(),
            conta.getTitular(),
            conta.getUsuario().getLogin(),
            conta.getUsuario().getId()
        );
    }
    
    /**
     * Cria ContaInfoDto sem saldo (para operações gerais)
     */
    public static ContaInfoDto criarContaInfoSemSaldo(Conta conta) {
        return new ContaInfoDto(
            conta.getId(),
            conta.getNumeroConta(),
            conta.getTitular(),
            conta.getUsuario().getLogin(),
            conta.getUsuario().getId()
        );
    }
    
    /**
     * Cria ContaInfoDto com saldo (para consultas de saldo, extrato e operações admin)
     */
    public static ContaInfoDto criarContaInfoComSaldo(Conta conta) {
        return new ContaInfoDto(
            conta.getId(),
            conta.getNumeroConta(),
            conta.getTitular(),
            conta.getUsuario().getLogin(),
            conta.getUsuario().getId(),
            conta.getSaldo()
        );
    }
    
    /**
     * Cria resposta padronizada com uma conta
     */
    public static Map<String, Object> criarRespostaPadraoComConta(String message, Conta conta, 
                                                                  boolean incluirSaldo, Map<String, Object> dadosAdicionais) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        if (incluirSaldo) {
            response.put("conta", criarContaInfoComSaldo(conta));
        } else {
            response.put("conta", criarContaInfoSemSaldo(conta));
        }
        
        if (dadosAdicionais != null && !dadosAdicionais.isEmpty()) {
            response.put("dados", dadosAdicionais);
        }
        
        return response;
    }
    
    /**
     * Cria resposta padronizada com duas contas (para transferências)
     */
    public static Map<String, Object> criarRespostaPadraoComDuasContas(String message, 
                                                                       Conta contaOrigem, Conta contaDestino, 
                                                                       boolean incluirSaldo, Map<String, Object> dadosAdicionais) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        if (incluirSaldo) {
            response.put("contaOrigem", criarContaInfoComSaldo(contaOrigem));
            response.put("contaDestino", criarContaInfoComSaldo(contaDestino));
        } else {
            response.put("contaOrigem", criarContaInfoSemSaldo(contaOrigem));
            response.put("contaDestino", criarContaInfoSemSaldo(contaDestino));
        }
        
        if (dadosAdicionais != null && !dadosAdicionais.isEmpty()) {
            response.put("dados", dadosAdicionais);
        }
        
        return response;
    }
    
    /**
     * Cria resposta padronizada simples (sem conta)
     */
    public static Map<String, Object> criarRespostaPadraoSimples(String message, Map<String, Object> dados) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        if (dados != null && !dados.isEmpty()) {
            response.put("dados", dados);
        }
        
        return response;
    }
    
    /**
     * Verifica se o usuário é admin
     */
    public static boolean isAdmin(Usuario usuario) {
        return PerfilUsuario.ADMIN.equals(usuario.getPerfil());
    }
}
