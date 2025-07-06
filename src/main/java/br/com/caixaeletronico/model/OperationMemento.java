package br.com.caixaeletronico.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class OperationMemento {
    
    private Map<Long, BigDecimal> saldosAntes;
    private Map<Long, List<SlotCedulaSnapshot>> slotsAntes;
    
    // Constructors
    public OperationMemento() {}
    
    public OperationMemento(Map<Long, BigDecimal> saldosAntes, Map<Long, List<SlotCedulaSnapshot>> slotsAntes) {
        this.saldosAntes = saldosAntes;
        this.slotsAntes = slotsAntes;
    }
    
    // Getters and Setters
    public Map<Long, BigDecimal> getSaldosAntes() {
        return saldosAntes;
    }
    
    public void setSaldosAntes(Map<Long, BigDecimal> saldosAntes) {
        this.saldosAntes = saldosAntes;
    }
    
    public Map<Long, List<SlotCedulaSnapshot>> getSlotsAntes() {
        return slotsAntes;
    }
    
    public void setSlotsAntes(Map<Long, List<SlotCedulaSnapshot>> slotsAntes) {
        this.slotsAntes = slotsAntes;
    }
    
    // Inner class for slot snapshot
    public static class SlotCedulaSnapshot {
        private Long slotId;
        private ValorCedula valorCedula;
        private Integer quantidade;
        
        public SlotCedulaSnapshot() {}
        
        public SlotCedulaSnapshot(Long slotId, ValorCedula valorCedula, Integer quantidade) {
            this.slotId = slotId;
            this.valorCedula = valorCedula;
            this.quantidade = quantidade;
        }
        
        // Getters and Setters
        public Long getSlotId() {
            return slotId;
        }
        
        public void setSlotId(Long slotId) {
            this.slotId = slotId;
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
