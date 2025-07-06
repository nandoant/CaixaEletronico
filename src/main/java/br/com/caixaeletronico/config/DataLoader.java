package br.com.caixaeletronico.config;

import br.com.caixaeletronico.model.*;
import br.com.caixaeletronico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ContaRepository contaRepository;
    
    @Autowired
    private SlotCedulaRepository slotCedulaRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            criarDadosIniciais();
        }
    }
    
    private void criarDadosIniciais() {
        // Criar usuário admin
        Usuario admin = new Usuario();
        admin.setLogin("admin");
        admin.setEmail("admin@caixaeletronico.com");
        admin.setSenha(passwordEncoder.encode("admin123"));
        admin.setPerfil(PerfilUsuario.ADMIN);
        usuarioRepository.save(admin);
        
        // Criar usuário cliente
        Usuario cliente = new Usuario();
        cliente.setLogin("cliente");
        cliente.setEmail("cliente@email.com");
        cliente.setSenha(passwordEncoder.encode("cliente123"));
        cliente.setPerfil(PerfilUsuario.CLIENTE);
        usuarioRepository.save(cliente);
        
        // Criar conta do cliente
        Conta conta = new Conta();
        conta.setTitular("João Silva");
        conta.setSaldo(new BigDecimal("5000.00"));
        conta.setUsuario(cliente);
        contaRepository.save(conta);
        
        // Criar slots de cédulas com estoque inicial
        criarSlotCedula(conta, ValorCedula.DUZENTOS, 50);
        criarSlotCedula(conta, ValorCedula.CEM, 100);
        criarSlotCedula(conta, ValorCedula.CINQUENTA, 200);
        criarSlotCedula(conta, ValorCedula.VINTE, 500);
        criarSlotCedula(conta, ValorCedula.DEZ, 1000);
        criarSlotCedula(conta, ValorCedula.CINCO, 2000);
        criarSlotCedula(conta, ValorCedula.DOIS, 5000);
        
        // Criar segunda conta para testes de transferência
        Conta conta2 = new Conta();
        conta2.setTitular("Maria Santos");
        conta2.setSaldo(new BigDecimal("3000.00"));
        conta2.setUsuario(cliente);
        contaRepository.save(conta2);
        
        // Criar slots de cédulas para segunda conta
        criarSlotCedula(conta2, ValorCedula.DUZENTOS, 25);
        criarSlotCedula(conta2, ValorCedula.CEM, 50);
        criarSlotCedula(conta2, ValorCedula.CINQUENTA, 100);
        criarSlotCedula(conta2, ValorCedula.VINTE, 250);
        criarSlotCedula(conta2, ValorCedula.DEZ, 500);
        criarSlotCedula(conta2, ValorCedula.CINCO, 1000);
        criarSlotCedula(conta2, ValorCedula.DOIS, 2500);
        
        System.out.println("Dados iniciais criados:");
        System.out.println("- Admin: login=admin, senha=admin123");
        System.out.println("- Cliente: login=cliente, senha=cliente123");
        System.out.println("- Conta 1: ID=1, Titular=João Silva, Saldo=R$ 5.000,00");
        System.out.println("- Conta 2: ID=2, Titular=Maria Santos, Saldo=R$ 3.000,00");
    }
    
    private void criarSlotCedula(Conta conta, ValorCedula valorCedula, int quantidade) {
        SlotCedula slot = new SlotCedula();
        slot.setConta(conta);
        slot.setValorCedula(valorCedula);
        slot.setQuantidade(quantidade);
        slotCedulaRepository.save(slot);
    }
}
