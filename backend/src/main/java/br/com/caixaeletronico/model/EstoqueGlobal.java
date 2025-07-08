package br.com.caixaeletronico.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
@Entity
@Table(name = "estoque_global")
public class EstoqueGlobal implements ICedula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull(message = "Valor da cédula é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(unique = true)
    private ValorCedula valorCedula;
    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 0, message = "Quantidade não pode ser negativa")
    private Integer quantidade;
    public EstoqueGlobal() {}
    public EstoqueGlobal(ValorCedula valorCedula, Integer quantidade) {
        this.valorCedula = valorCedula;
        this.quantidade = quantidade;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
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
