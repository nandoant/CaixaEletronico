package br.com.caixaeletronico.model;

public enum TipoPagamento {
    TRANSFERENCIA("Transferência"),
    BOLETO("Boleto"),
    PIX("PIX"),
    PAGAMENTO_GERAL("Pagamento Geral");
    
    private final String descricao;
    
    TipoPagamento(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
}
