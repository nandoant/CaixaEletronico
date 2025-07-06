package br.com.caixaeletronico.dto;

import br.com.caixaeletronico.model.TipoOperacao;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OperacaoDto {
    
    private Long id;
    private TipoOperacao tipo;
    private LocalDateTime dataHora;
    private BigDecimal valor;
    private String usuarioResponsavel;
    private String descricao;
    
    // Constructors
    public OperacaoDto() {
    }
    
    public OperacaoDto(Long id, TipoOperacao tipo, LocalDateTime dataHora, 
                      BigDecimal valor, String usuarioResponsavel) {
        this.id = id;
        this.tipo = tipo;
        this.dataHora = dataHora;
        this.valor = valor;
        this.usuarioResponsavel = usuarioResponsavel;
        this.descricao = gerarDescricao(tipo);
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
        this.descricao = gerarDescricao(tipo);
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
    
    public String getUsuarioResponsavel() {
        return usuarioResponsavel;
    }
    
    public void setUsuarioResponsavel(String usuarioResponsavel) {
        this.usuarioResponsavel = usuarioResponsavel;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    // Método auxiliar para gerar descrição baseada no tipo
    private String gerarDescricao(TipoOperacao tipo) {
        if (tipo == null) {
            return "Operação não identificada";
        }
        
        switch (tipo) {
            case DEPOSITO:
                return "Depósito em dinheiro";
            case SAQUE:
                return "Saque no caixa eletrônico";
            case TRANSFERENCIA:
                return "Transferência entre contas";
            case PAGAMENTO_IMEDIATO:
                return "Pagamento imediato";
            case PAGAMENTO_PARCELA:
                return "Pagamento de parcela";
            case DESFAZER:
                return "Operação desfeita";
            default:
                return "Operação bancária";
        }
    }
}
