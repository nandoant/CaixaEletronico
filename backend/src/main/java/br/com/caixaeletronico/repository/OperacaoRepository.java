package br.com.caixaeletronico.repository;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.model.TipoOperacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface OperacaoRepository extends JpaRepository<Operacao, Long> {
    List<Operacao> findByContaOrigemOrderByDataHoraDesc(Conta conta);
    List<Operacao> findByContaDestinoOrderByDataHoraDesc(Conta conta);
    @Query("SELECT o FROM Operacao o WHERE (o.contaOrigem = :conta OR o.contaDestino = :conta) ORDER BY o.dataHora DESC")
    List<Operacao> findByContaOrderByDataHoraDesc(@Param("conta") Conta conta);
    @Query("SELECT o FROM Operacao o WHERE (o.contaOrigem = :conta OR o.contaDestino = :conta) " +
           "AND o.dataHora BETWEEN :dataInicio AND :dataFim ORDER BY o.dataHora DESC")
    List<Operacao> findByContaAndDataHoraBetweenOrderByDataHoraDesc(
        @Param("conta") Conta conta,
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );
    List<Operacao> findByTipoAndMementoJsonIsNotNull(TipoOperacao tipo);
    List<Operacao> findByUsuarioResponsavelOrderByDataHoraDesc(String usuarioResponsavel);
    @Query("SELECT o FROM Operacao o LEFT JOIN FETCH o.contaOrigem LEFT JOIN FETCH o.contaDestino WHERE o.usuarioResponsavel = :usuarioResponsavel ORDER BY o.dataHora DESC")
    List<Operacao> findByUsuarioResponsavelWithContasOrderByDataHoraDesc(@Param("usuarioResponsavel") String usuarioResponsavel);
    @Query("SELECT o FROM Operacao o WHERE o.usuarioResponsavel = :usuarioResponsavel AND o.desfeita = false ORDER BY o.dataHora DESC")
    List<Operacao> findByUsuarioResponsavelAndNaoDesfeita(@Param("usuarioResponsavel") String usuarioResponsavel);
    @Query("SELECT o FROM Operacao o WHERE o.id = :operacaoId AND o.usuarioResponsavel = :usuarioResponsavel AND o.desfeita = false")
    Operacao findByIdAndUsuarioResponsavelAndNaoDesfeita(@Param("operacaoId") Long operacaoId, @Param("usuarioResponsavel") String usuarioResponsavel);
}
