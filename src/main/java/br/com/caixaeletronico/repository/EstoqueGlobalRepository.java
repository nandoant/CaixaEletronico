package br.com.caixaeletronico.repository;

import br.com.caixaeletronico.model.EstoqueGlobal;
import br.com.caixaeletronico.model.ValorCedula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstoqueGlobalRepository extends JpaRepository<EstoqueGlobal, Long> {
    
    Optional<EstoqueGlobal> findByValorCedula(ValorCedula valorCedula);
    
    List<EstoqueGlobal> findByQuantidadeGreaterThan(Integer quantidade);
    
    List<EstoqueGlobal> findAllByOrderByValorCedulaDesc();
}
