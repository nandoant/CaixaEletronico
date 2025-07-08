package br.com.caixaeletronico.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pagamentos_agendados")
public class PagamentoAgendado {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conta_origem_id")
    @NotNull(message = "Conta origem é obrigatória")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "usuario", "operacoes"})
    private Conta contaOrigem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conta_destino_id")
    @NotNull(message = "Conta destino é obrigatória")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "usuario", "operacoes"})
    private Conta contaDestino;
    
    @NotNull(message = "Valor total é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor total deve ser maior que zero")
    @Column(precision = 10, scale = 2)
    private BigDecimal valorTotal;
    
    @NotNull(message = "Quantidade de parcelas é obrigatória")
    @Min(value = 1, message = "Quantidade de parcelas deve ser maior que zero")
    private Integer quantidadeParcelas;
    
    @NotNull(message = "Periodicidade em dias é obrigatória")
    @Min(value = 1, message = "Periodicidade deve ser maior que zero")
    private Integer periodicidadeDias;
    
    @NotNull(message = "Data da próxima execução é obrigatória")
    private LocalDate dataProximaExecucao;
    
    @NotNull(message = "Parcelas restantes é obrigatório")
    @Min(value = 0, message = "Parcelas restantes não pode ser negativo")
    private Integer parcelasRestantes;
    
    @NotNull(message = "Status é obrigatório")
    @Enumerated(EnumType.STRING)
    private StatusAgendamento status;
    
    @Column(length = 255)
    private String descricao;
    
    // Constructors
    public PagamentoAgendado() {}
    
    public PagamentoAgendado(Conta contaOrigem, Conta contaDestino, BigDecimal valorTotal, 
                           Integer quantidadeParcelas, Integer periodicidadeDias, 
                           LocalDate dataProximaExecucao, String descricao) {
        this.contaOrigem = contaOrigem;
        this.contaDestino = contaDestino;
        this.valorTotal = valorTotal;
        this.quantidadeParcelas = quantidadeParcelas;
        this.periodicidadeDias = periodicidadeDias;
        this.dataProximaExecucao = dataProximaExecucao;
        this.parcelasRestantes = quantidadeParcelas;
        this.status = StatusAgendamento.ATIVO;
        this.descricao = descricao;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Conta getContaOrigem() {
        return contaOrigem;
    }
    
    public void setContaOrigem(Conta contaOrigem) {
        this.contaOrigem = contaOrigem;
    }
    
    public Conta getContaDestino() {
        return contaDestino;
    }
    
    public void setContaDestino(Conta contaDestino) {
        this.contaDestino = contaDestino;
    }
    
    public BigDecimal getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public Integer getQuantidadeParcelas() {
        return quantidadeParcelas;
    }
    
    public void setQuantidadeParcelas(Integer quantidadeParcelas) {
        this.quantidadeParcelas = quantidadeParcelas;
    }
    
    public Integer getPeriodicidadeDias() {
        return periodicidadeDias;
    }
    
    public void setPeriodicidadeDias(Integer periodicidadeDias) {
        this.periodicidadeDias = periodicidadeDias;
    }
    
    public LocalDate getDataProximaExecucao() {
        return dataProximaExecucao;
    }
    
    public void setDataProximaExecucao(LocalDate dataProximaExecucao) {
        this.dataProximaExecucao = dataProximaExecucao;
    }
    
    public Integer getParcelasRestantes() {
        return parcelasRestantes;
    }
    
    public void setParcelasRestantes(Integer parcelasRestantes) {
        this.parcelasRestantes = parcelasRestantes;
    }
    
    public StatusAgendamento getStatus() {
        return status;
    }
    
    public void setStatus(StatusAgendamento status) {
        this.status = status;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    // Helper methods
    public BigDecimal getValorParcela() {
        return valorTotal.divide(BigDecimal.valueOf(quantidadeParcelas), 2, java.math.RoundingMode.HALF_UP);
    }
    
    public void processarParcela() {
        if (parcelasRestantes > 0) {
            parcelasRestantes--;
            dataProximaExecucao = dataProximaExecucao.plusDays(periodicidadeDias);
            
            if (parcelasRestantes == 0) {
                status = StatusAgendamento.CONCLUIDO;
            }
        }
    }
}
