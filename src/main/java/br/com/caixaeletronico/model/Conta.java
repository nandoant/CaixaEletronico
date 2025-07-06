package br.com.caixaeletronico.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contas")
public class Conta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Titular é obrigatório")
    @Size(min = 3, max = 100, message = "Titular deve ter entre 3 e 100 caracteres")
    private String titular;
    
    @NotNull(message = "Saldo é obrigatório")
    @DecimalMin(value = "0.0", inclusive = true, message = "Saldo não pode ser negativo")
    @Column(precision = 10, scale = 2)
    private BigDecimal saldo;
    
    @OneToMany(mappedBy = "conta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SlotCedula> slotsCedulas = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    // Constructors
    public Conta() {}
    
    public Conta(String titular, BigDecimal saldo, Usuario usuario) {
        this.titular = titular;
        this.saldo = saldo;
        this.usuario = usuario;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitular() {
        return titular;
    }
    
    public void setTitular(String titular) {
        this.titular = titular;
    }
    
    public BigDecimal getSaldo() {
        return saldo;
    }
    
    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
    
    public List<SlotCedula> getSlotsCedulas() {
        return slotsCedulas;
    }
    
    public void setSlotsCedulas(List<SlotCedula> slotsCedulas) {
        this.slotsCedulas = slotsCedulas;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    // Helper methods
    public void adicionarSlotCedula(SlotCedula slot) {
        slotsCedulas.add(slot);
        slot.setConta(this);
    }
    
    public void removerSlotCedula(SlotCedula slot) {
        slotsCedulas.remove(slot);
        slot.setConta(null);
    }
}
