package br.com.caixaeletronico.model;

import java.util.Map;
import java.util.UUID;

public class CombinacaoCedulas {
    
    private UUID idOpcao;
    private Map<ValorCedula, Integer> mapaCedulas;
    private int quantidadeTotalDeNotas;
    private String descricaoLegivel;
    
    // Constructors
    public CombinacaoCedulas() {
        this.idOpcao = UUID.randomUUID();
    }
    
    public CombinacaoCedulas(Map<ValorCedula, Integer> mapaCedulas) {
        this();
        this.mapaCedulas = mapaCedulas;
        this.quantidadeTotalDeNotas = mapaCedulas.values().stream().mapToInt(Integer::intValue).sum();
        this.descricaoLegivel = gerarDescricaoLegivel();
    }
    
    // Getters and Setters
    public UUID getIdOpcao() {
        return idOpcao;
    }
    
    public void setIdOpcao(UUID idOpcao) {
        this.idOpcao = idOpcao;
    }
    
    public Map<ValorCedula, Integer> getMapaCedulas() {
        return mapaCedulas;
    }
    
    public void setMapaCedulas(Map<ValorCedula, Integer> mapaCedulas) {
        this.mapaCedulas = mapaCedulas;
        this.quantidadeTotalDeNotas = mapaCedulas.values().stream().mapToInt(Integer::intValue).sum();
        this.descricaoLegivel = gerarDescricaoLegivel();
    }
    
    public int getQuantidadeTotalDeNotas() {
        return quantidadeTotalDeNotas;
    }
    
    public void setQuantidadeTotalDeNotas(int quantidadeTotalDeNotas) {
        this.quantidadeTotalDeNotas = quantidadeTotalDeNotas;
    }
    
    public String getDescricaoLegivel() {
        return descricaoLegivel;
    }
    
    public void setDescricaoLegivel(String descricaoLegivel) {
        this.descricaoLegivel = descricaoLegivel;
    }
    
    // Helper methods
    private String gerarDescricaoLegivel() {
        StringBuilder sb = new StringBuilder();
        
        mapaCedulas.entrySet().stream()
            .filter(entry -> entry.getValue() > 0)
            .sorted((e1, e2) -> Integer.compare(e2.getKey().getValor(), e1.getKey().getValor()))
            .forEach(entry -> {
                if (sb.length() > 0) {
                    sb.append(", ");
                }
                sb.append(entry.getValue())
                  .append("x R$")
                  .append(entry.getKey().getValor());
            });
        
        return sb.toString();
    }
    
    public int calcularValorTotal() {
        return mapaCedulas.entrySet().stream()
            .mapToInt(entry -> entry.getKey().getValor() * entry.getValue())
            .sum();
    }
}
