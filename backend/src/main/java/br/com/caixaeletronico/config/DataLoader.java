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
    private EstoqueGlobalRepository estoqueGlobalRepository;
    
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
        
        // Criar segundo usuário cliente para testes de transferência
        Usuario cliente2 = new Usuario();
        cliente2.setLogin("cliente2");
        cliente2.setEmail("cliente2@email.com");
        cliente2.setSenha(passwordEncoder.encode("cliente123"));
        cliente2.setPerfil(PerfilUsuario.CLIENTE);
        usuarioRepository.save(cliente2);
        
        // Criar conta do segundo cliente
        Conta conta2 = new Conta();
        conta2.setTitular("Maria Santos");
        conta2.setSaldo(new BigDecimal("3000.00"));
        conta2.setUsuario(cliente2);
        contaRepository.save(conta2);
        
        // Criar estoque global de cédulas
        criarEstoqueGlobal(ValorCedula.DUZENTOS, 100);
        criarEstoqueGlobal(ValorCedula.CEM, 200);
        criarEstoqueGlobal(ValorCedula.CINQUENTA, 400);
        criarEstoqueGlobal(ValorCedula.VINTE, 1000);
        criarEstoqueGlobal(ValorCedula.DEZ, 2000);
        criarEstoqueGlobal(ValorCedula.CINCO, 4000);
        criarEstoqueGlobal(ValorCedula.DOIS, 10000);
        
        System.out.println("Dados iniciais criados:");
        System.out.println("- Admin: login=admin, senha=admin123");
        System.out.println("- Cliente 1: login=cliente, senha=cliente123");
        System.out.println("- Cliente 2: login=cliente2, senha=cliente123");
        System.out.println("- Conta 1: ID=1, Titular=João Silva, Saldo=R$ 5.000,00");
        System.out.println("- Conta 2: ID=2, Titular=Maria Santos, Saldo=R$ 3.000,00");
        System.out.println("- Estoque global de cédulas criado");
    }
    
    private void criarEstoqueGlobal(ValorCedula valorCedula, int quantidade) {
        EstoqueGlobal estoque = new EstoqueGlobal();
        estoque.setValorCedula(valorCedula);
        estoque.setQuantidade(quantidade);
        estoqueGlobalRepository.save(estoque);
    }
}
