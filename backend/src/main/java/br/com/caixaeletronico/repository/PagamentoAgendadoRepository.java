package br.com.caixaeletronico.repository;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PagamentoAgendado;
import br.com.caixaeletronico.model.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagamentoAgendadoRepository extends JpaRepository<PagamentoAgendado, Long> {
    
    List<PagamentoAgendado> findByContaOrigem(Conta conta);
    
    List<PagamentoAgendado> findByContaOrigemAndStatus(Conta conta, StatusAgendamento status);
    
    // Novos métodos para pagamentos recebidos
    List<PagamentoAgendado> findByContaDestino(Conta conta);
    
    List<PagamentoAgendado> findByContaDestinoAndStatus(Conta conta, StatusAgendamento status);
    
    @Query("SELECT p FROM PagamentoAgendado p WHERE p.status = :status AND p.dataProximaExecucao <= :data")
    List<PagamentoAgendado> findByStatusAndDataProximaExecucaoLessThanEqual(
        @Param("status") StatusAgendamento status,
        @Param("data") LocalDate data
    );
    
    @Query("SELECT p FROM PagamentoAgendado p WHERE p.status = 'ATIVO' AND p.dataProximaExecucao <= :hoje")
    List<PagamentoAgendado> findPagamentosVencidos(@Param("hoje") LocalDate hoje);
}
