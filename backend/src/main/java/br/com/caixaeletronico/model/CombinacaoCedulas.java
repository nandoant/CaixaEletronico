package br.com.caixaeletronico.model;
import java.util.Map;
import java.util.UUID;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
public class CombinacaoCedulas {
    private UUID idOpcao;
    private Map<ValorCedula, Integer> mapaCedulas;
    private int quantidadeTotalDeNotas;
    private String descricaoLegivel;
    public CombinacaoCedulas() {
        this.idOpcao = UUID.randomUUID();
    }
    public CombinacaoCedulas(Map<ValorCedula, Integer> mapaCedulas) {
        this.mapaCedulas = mapaCedulas;
        this.quantidadeTotalDeNotas = mapaCedulas.values().stream().mapToInt(Integer::intValue).sum();
        this.descricaoLegivel = gerarDescricaoLegivel();
        this.idOpcao = gerarUUIDDeterministico();
    }
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
    private UUID gerarUUIDDeterministico() {
        try {
            String conteudo = gerarConteudoParaHash();
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(conteudo.getBytes(StandardCharsets.UTF_8));
            long mostSigBits = 0;
            long leastSigBits = 0;
            for (int i = 0; i < 8; i++) {
                mostSigBits = (mostSigBits << 8) | (hash[i] & 0xFF);
            }
            for (int i = 8; i < 16; i++) {
                leastSigBits = (leastSigBits << 8) | (hash[i] & 0xFF);
            }
            return new UUID(mostSigBits, leastSigBits);
        } catch (Exception e) {
            return UUID.randomUUID();
        }
    }
    private String gerarConteudoParaHash() {
        StringBuilder sb = new StringBuilder();
        mapaCedulas.entrySet().stream()
            .sorted((e1, e2) -> Integer.compare(e1.getKey().getValor(), e2.getKey().getValor()))
            .forEach(entry -> {
                sb.append(entry.getKey().getValor())
                  .append(":")
                  .append(entry.getValue())
                  .append(";");
            });
        return sb.toString();
    }
}
