package br.com.caixaeletronico.dto;
import java.math.BigDecimal;
public class ContaInfoDto {
    private Long contaId;
    private String numeroConta;
    private String titular;
    private String usuarioProprietario;
    private Long usuarioProprietarioId;
    private BigDecimal saldo;
    public ContaInfoDto(Long contaId, String numeroConta, String titular, 
                       String usuarioProprietario, Long usuarioProprietarioId) {
        this.contaId = contaId;
        this.numeroConta = numeroConta;
        this.titular = titular;
        this.usuarioProprietario = usuarioProprietario;
        this.usuarioProprietarioId = usuarioProprietarioId;
    }
    public ContaInfoDto(Long contaId, String numeroConta, String titular, 
                       String usuarioProprietario, Long usuarioProprietarioId, 
                       BigDecimal saldo) {
        this.contaId = contaId;
        this.numeroConta = numeroConta;
        this.titular = titular;
        this.usuarioProprietario = usuarioProprietario;
        this.usuarioProprietarioId = usuarioProprietarioId;
        this.saldo = saldo;
    }
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
    public BigDecimal getSaldo() {
        return saldo;
    }
    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
}
