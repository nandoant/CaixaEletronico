package br.com.caixaeletronico.repository;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.SlotCedula;
import br.com.caixaeletronico.model.ValorCedula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlotCedulaRepository extends JpaRepository<SlotCedula, Long> {
    
    List<SlotCedula> findByConta(Conta conta);
    
    Optional<SlotCedula> findByContaAndValorCedula(Conta conta, ValorCedula valorCedula);
    
    List<SlotCedula> findByContaOrderByValorCedulaDesc(Conta conta);
    
    List<SlotCedula> findByContaAndQuantidadeGreaterThan(Conta conta, Integer quantidade);
}
