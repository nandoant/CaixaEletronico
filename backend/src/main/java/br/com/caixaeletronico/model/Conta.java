package br.com.caixaeletronico.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

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
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;
    
    @NotBlank(message = "Número da conta é obrigatório")
    @Column(unique = true, length = 20)
    private String numeroConta;
    
    // Constructors
    public Conta() {}
    
    public Conta(String titular, BigDecimal saldo, Usuario usuario, String numeroConta) {
        this.titular = titular;
        this.saldo = saldo;
        this.usuario = usuario;
        this.numeroConta = numeroConta;
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
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public String getNumeroConta() {
        return numeroConta;
    }
    
    public void setNumeroConta(String numeroConta) {
        this.numeroConta = numeroConta;
    }
}
