package br.com.caixaeletronico.dto;

public class ContaBasicaDto {
    private Long contaId;
    private String numeroConta;
    private String titular;
    private String usuarioProprietario;
    private Long usuarioProprietarioId;
    
    public ContaBasicaDto() {}
    
    public ContaBasicaDto(Long contaId, String numeroConta, String titular, 
                         String usuarioProprietario, Long usuarioProprietarioId) {
        this.contaId = contaId;
        this.numeroConta = numeroConta;
        this.titular = titular;
        this.usuarioProprietario = usuarioProprietario;
        this.usuarioProprietarioId = usuarioProprietarioId;
    }
    
    // Getters and Setters
    public Long getContaId() {
        return contaId;
    }
    
    public void setContaId(Long contaId) {
        this.contaId = contaId;
    }
    
    public String getNumeroConta() {
        return numeroConta;
    }
    
    public void setNumeroConta(String numeroConta) {
        this.numeroConta = numeroConta;
    }
    
    public String getTitular() {
        return titular;
    }
    
    public void setTitular(String titular) {
        this.titular = titular;
    }
    
    public String getUsuarioProprietario() {
        return usuarioProprietario;
    }
    
    public void setUsuarioProprietario(String usuarioProprietario) {
        this.usuarioProprietario = usuarioProprietario;
    }
    
    public Long getUsuarioProprietarioId() {
        return usuarioProprietarioId;
    }
    
    public void setUsuarioProprietarioId(Long usuarioProprietarioId) {
        this.usuarioProprietarioId = usuarioProprietarioId;
    }
}
