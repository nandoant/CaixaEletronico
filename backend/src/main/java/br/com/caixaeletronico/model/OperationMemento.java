package br.com.caixaeletronico.model;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
public class OperationMemento {
    private Map<Long, BigDecimal> saldosAntes;
    private List<EstoqueGlobalSnapshot> estoquesAntes;
    public OperationMemento() {}
    public OperationMemento(Map<Long, BigDecimal> saldosAntes, List<EstoqueGlobalSnapshot> estoquesAntes) {
        this.saldosAntes = saldosAntes;
        this.estoquesAntes = estoquesAntes;
    }
    public Map<Long, BigDecimal> getSaldosAntes() {
        return saldosAntes;
    }
    public void setSaldosAntes(Map<Long, BigDecimal> saldosAntes) {
        this.saldosAntes = saldosAntes;
    }
    public List<EstoqueGlobalSnapshot> getEstoquesAntes() {
        return estoquesAntes;
    }
    public void setEstoquesAntes(List<EstoqueGlobalSnapshot> estoquesAntes) {
        this.estoquesAntes = estoquesAntes;
    }
    public static class EstoqueGlobalSnapshot {
        private ValorCedula valorCedula;
        private Integer quantidade;
        public EstoqueGlobalSnapshot() {}
        public EstoqueGlobalSnapshot(ValorCedula valorCedula, Integer quantidade) {
            this.valorCedula = valorCedula;
            this.quantidade = quantidade;
        }
        public ValorCedula getValorCedula() {
            return valorCedula;
        }
        public void setValorCedula(ValorCedula valorCedula) {
            this.valorCedula = valorCedula;
        }
        public Integer getQuantidade() {
            return quantidade;
        }
        public void setQuantidade(Integer quantidade) {
            this.quantidade = quantidade;
        }
    }
}
