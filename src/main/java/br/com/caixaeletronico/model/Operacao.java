package br.com.caixaeletronico.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "operacoes")
public class Operacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Tipo de operação é obrigatório")
    @Enumerated(EnumType.STRING)
    private TipoOperacao tipo;
    
    @NotNull(message = "Data e hora são obrigatórias")
    private LocalDateTime dataHora;
    
    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.0", inclusive = true, message = "Valor não pode ser negativo")
    @Column(precision = 10, scale = 2)
    private BigDecimal valor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conta_origem_id")
    private Conta contaOrigem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conta_destino_id")
    private Conta contaDestino;
    
    @Column(columnDefinition = "TEXT")
    private String mementoJson;
    
    @NotBlank(message = "Usuário responsável é obrigatório")
    @Size(max = 100, message = "Usuário responsável deve ter no máximo 100 caracteres")
    private String usuarioResponsavel;
    
    // Constructors
    public Operacao() {
        this.dataHora = LocalDateTime.now();
    }
    
    public Operacao(TipoOperacao tipo, BigDecimal valor, Conta contaOrigem, String usuarioResponsavel) {
        this();
        this.tipo = tipo;
        this.valor = valor;
        this.contaOrigem = contaOrigem;
        this.usuarioResponsavel = usuarioResponsavel;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public TipoOperacao getTipo() {
        return tipo;
    }
    
    public void setTipo(TipoOperacao tipo) {
        this.tipo = tipo;
    }
    
    public LocalDateTime getDataHora() {
        return dataHora;
    }
    
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
    
    public BigDecimal getValor() {
        return valor;
    }
    
    public void setValor(BigDecimal valor) {
        this.valor = valor;
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
    
    public String getMementoJson() {
        return mementoJson;
    }
    
    public void setMementoJson(String mementoJson) {
        this.mementoJson = mementoJson;
    }
    
    public String getUsuarioResponsavel() {
        return usuarioResponsavel;
    }
    
    public void setUsuarioResponsavel(String usuarioResponsavel) {
        this.usuarioResponsavel = usuarioResponsavel;
    }
}
