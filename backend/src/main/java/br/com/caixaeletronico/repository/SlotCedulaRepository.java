package br.com.caixaeletronico.repository;
import br.com.caixaeletronico.model.SlotCedula;
import br.com.caixaeletronico.model.ValorCedula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface SlotCedulaRepository extends JpaRepository<SlotCedula, Long> {
    Optional<SlotCedula> findByValorCedula(ValorCedula valorCedula);
    List<SlotCedula> findAllByOrderByValorCedulaDesc();
    List<SlotCedula> findByQuantidadeGreaterThan(Integer quantidade);
}
