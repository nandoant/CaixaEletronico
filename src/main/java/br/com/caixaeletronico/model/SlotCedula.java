package br.com.caixaeletronico.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "slots_cedulas")
public class SlotCedula {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conta_id")
    @NotNull(message = "Conta é obrigatória")
    private Conta conta;
    
    @NotNull(message = "Valor da cédula é obrigatório")
    @Enumerated(EnumType.STRING)
    private ValorCedula valorCedula;
    
    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 0, message = "Quantidade não pode ser negativa")
    private Integer quantidade;
    
    // Constructors
    public SlotCedula() {}
    
    public SlotCedula(Conta conta, ValorCedula valorCedula, Integer quantidade) {
        this.conta = conta;
        this.valorCedula = valorCedula;
        this.quantidade = quantidade;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Conta getConta() {
        return conta;
    }
    
    public void setConta(Conta conta) {
        this.conta = conta;
    }
    
    public ValorCedula getValorCedula() {
        return valorCedula;
    }
    
    public void setValorCedula(ValorCedula valorCedula) {
        this.valorCedula = valorCedula;
    }
    
    public Integer getQuantidade() {
        return quantidade;
    }
    
    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
    
    // Helper methods
    public void adicionarQuantidade(int valor) {
        this.quantidade += valor;
    }
    
    public void removerQuantidade(int valor) {
        if (this.quantidade >= valor) {
            this.quantidade -= valor;
        } else {
            throw new IllegalArgumentException("Quantidade insuficiente de cédulas");
        }
    }
}
