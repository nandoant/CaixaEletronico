package br.com.caixaeletronico.dto;
import java.time.LocalDateTime;
public class ResponsePadrao<T> {
    private String message;
    private LocalDateTime timestamp;
    private T dados;
    public ResponsePadrao() {
        this.timestamp = LocalDateTime.now();
    }
    public ResponsePadrao(String message, T dados) {
        this.message = message;
        this.dados = dados;
        this.timestamp = LocalDateTime.now();
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public T getDados() {
        return dados;
    }
    public void setDados(T dados) {
        this.dados = dados;
    }
}
