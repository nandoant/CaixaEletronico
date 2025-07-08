package br.com.caixaeletronico.model;
public enum ValorCedula {
    DOIS(2),
    CINCO(5),
    DEZ(10),
    VINTE(20),
    CINQUENTA(50),
    CEM(100),
    DUZENTOS(200);
    private final int valor;
    ValorCedula(int valor) {
        this.valor = valor;
    }
    public int getValor() {
        return valor;
    }
    public static ValorCedula fromValor(int valor) {
        for (ValorCedula cedula : values()) {
            if (cedula.valor == valor) {
                return cedula;
            }
        }
        throw new IllegalArgumentException("Valor de cédula inválido: " + valor);
    }
}
