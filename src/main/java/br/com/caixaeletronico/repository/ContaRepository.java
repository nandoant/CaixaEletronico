package br.com.caixaeletronico.repository;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContaRepository extends JpaRepository<Conta, Long> {
    
    List<Conta> findByUsuario(Usuario usuario);
    
    Optional<Conta> findByIdAndUsuario(Long id, Usuario usuario);
    
    @Query("SELECT c FROM Conta c LEFT JOIN FETCH c.slotsCedulas WHERE c.id = :id")
    Optional<Conta> findByIdWithSlots(@Param("id") Long id);
    
    @Query("SELECT c FROM Conta c LEFT JOIN FETCH c.slotsCedulas WHERE c.id = :id AND c.usuario = :usuario")
    Optional<Conta> findByIdAndUsuarioWithSlots(@Param("id") Long id, @Param("usuario") Usuario usuario);
}
