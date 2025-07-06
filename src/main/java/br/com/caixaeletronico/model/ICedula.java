package br.com.caixaeletronico.model;

public interface ICedula {
    ValorCedula getValorCedula();
    Integer getQuantidade();
    void setQuantidade(Integer quantidade);
    void adicionarQuantidade(int valor);
    void removerQuantidade(int valor);
}
