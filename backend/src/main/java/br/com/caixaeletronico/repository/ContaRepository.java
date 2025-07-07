package br.com.caixaeletronico.repository;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContaRepository extends JpaRepository<Conta, Long> {
    
    Optional<Conta> findByUsuario(Usuario usuario);
    
}
