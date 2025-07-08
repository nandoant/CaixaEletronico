package br.com.caixaeletronico.repository;
import br.com.caixaeletronico.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLogin(String login);
    Optional<Usuario> findByEmail(String email);
    boolean existsByLogin(String login);
    boolean existsByEmail(String email);
}
