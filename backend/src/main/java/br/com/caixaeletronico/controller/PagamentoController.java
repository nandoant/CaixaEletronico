package br.com.caixaeletronico.controller;
import br.com.caixaeletronico.config.CustomUserDetailsService;
import br.com.caixaeletronico.controller.api.PagamentoControllerApi;
import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.PagamentoAgendado;
import br.com.caixaeletronico.model.StatusAgendamento;
import br.com.caixaeletronico.model.Usuario;
import br.com.caixaeletronico.repository.ContaRepository;
import br.com.caixaeletronico.service.PaymentScheduleService;
import br.com.caixaeletronico.util.ResponseUtil;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/pagamentos")
public class PagamentoController implements PagamentoControllerApi {
    @Autowired
    private PaymentScheduleService paymentScheduleService;
    @Autowired
    private ContaRepository contaRepository;
    @PostMapping("/agendar")
    @Override
    public ResponseEntity<?> agendarTransferencia(
            @RequestBody TransferenciaAgendadaRequest request,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            Conta contaOrigem = usuario.getConta();
            if (contaOrigem == null) {
                throw new RuntimeException("Usuário não possui conta associada");
            }
            Conta contaDestino = contaRepository.findById(request.getContaDestinoId())
                .orElseThrow(() -> new RuntimeException("Conta destino não encontrada"));
            if (contaOrigem.getId().equals(contaDestino.getId())) {
                throw new RuntimeException("Conta origem e destino não podem ser iguais");
            }
            PagamentoAgendado transferencia = paymentScheduleService.criarTransferenciaAgendada(
                contaOrigem,
                contaDestino,
                request.getValorTotal(),
                request.getQuantidadeParcelas(),
                request.getPeriodicidadeDias(),
                request.getDataInicio(),
                request.isDebitarPrimeiraParcela(),
                request.getDescricao()
            );
            Map<String, Object> dadosAgendamento = new HashMap<>();
            dadosAgendamento.put("agendamento", Map.of(
                "id", transferencia.getId(),
                "valorTotal", transferencia.getValorTotal(),
                "valorParcela", transferencia.getValorParcela(),
                "quantidadeParcelas", transferencia.getQuantidadeParcelas(),
                "dataProximaExecucao", transferencia.getDataProximaExecucao(),
                "status", transferencia.getStatus(),
                "descricao", transferencia.getDescricao(),
                "primeiraParcelaDebitada", request.isDebitarPrimeiraParcela()
            ));
            if (request.isDebitarPrimeiraParcela()) {
                dadosAgendamento.put("valorDebitadoAgora", transferencia.getValorParcela());
            }
            Map<String, Object> response = ResponseUtil.criarRespostaPadraoComDuasContas(
                "Transferência agendada com sucesso", contaOrigem, contaDestino, false, dadosAgendamento);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> obterPagamento(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            PagamentoAgendado pagamento = paymentScheduleService.obterPagamentoPorId(id);
            if (!pagamento.getContaOrigem().getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Pagamento não autorizado");
            }
            PagamentoAgendadoDTO pagamentoDTO = convertToDTO(pagamento);
            return ResponseEntity.ok(pagamentoDTO);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/conta/{contaId}")
    public ResponseEntity<?> listarPagamentosPorConta(
            @PathVariable Long contaId,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            Conta conta = contaRepository.findById(contaId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            if (!conta.getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Acesso negado: você não tem permissão para acessar esta conta");
            }
            List<PagamentoAgendado> pagamentos = paymentScheduleService.obterTodosPagamentos(conta);
            List<PagamentoAgendadoDTO> pagamentosDTO = pagamentos.stream()
                .map(this::convertToDTO)
                .toList();
            Map<String, Object> response = new HashMap<>();
            response.put("contaId", conta.getId());
            response.put("pagamentos", pagamentosDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/conta/{contaId}/recebidos")
    public ResponseEntity<?> listarPagamentosRecebidos(
            @PathVariable Long contaId,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            Conta conta = contaRepository.findById(contaId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            if (!conta.getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Acesso negado: você não tem permissão para acessar esta conta");
            }
            List<PagamentoAgendado> pagamentosRecebidos = paymentScheduleService.obterPagamentosRecebidos(conta);
            List<PagamentoAgendadoDTO> pagamentosDTO = pagamentosRecebidos.stream()
                .map(this::convertToDTO)
                .toList();
            Map<String, Object> response = new HashMap<>();
            response.put("contaId", conta.getId());
            response.put("pagamentosRecebidos", pagamentosDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/conta/{contaId}/todos")
    public ResponseEntity<?> listarTodosPagamentosConta(
            @PathVariable Long contaId,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            Conta conta = contaRepository.findById(contaId)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
            if (!conta.getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Acesso negado: você não tem permissão para acessar esta conta");
            }
            List<PagamentoAgendado> pagamentosEnviados = paymentScheduleService.obterTodosPagamentos(conta);
            List<PagamentoAgendado> pagamentosRecebidos = paymentScheduleService.obterPagamentosRecebidos(conta);
            List<PagamentoAgendadoDTO> pagamentosEnviadosDTO = pagamentosEnviados.stream()
                .map(this::convertToDTO)
                .toList();
            List<PagamentoAgendadoDTO> pagamentosRecebidosDTO = pagamentosRecebidos.stream()
                .map(this::convertToDTO)
                .toList();
            Map<String, Object> response = new HashMap<>();
            response.put("contaId", conta.getId());
            response.put("pagamentosEnviados", pagamentosEnviadosDTO);
            response.put("pagamentosRecebidos", pagamentosRecebidosDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarPagamento(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal principal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            Usuario usuario = principal.getUsuario();
            PagamentoAgendado pagamento = paymentScheduleService.obterPagamentoPorId(id);
            if (!pagamento.getContaOrigem().getUsuario().getId().equals(usuario.getId())) {
                throw new RuntimeException("Pagamento não autorizado");
            }
            paymentScheduleService.cancelarPagamento(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Pagamento cancelado com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @Schema(description = "Dados para agendar transferência entre contas")
    public static class TransferenciaAgendadaRequest {
        @Schema(description = "ID da conta destino", example = "5", required = true)
        private Long contaDestinoId;
        @Schema(description = "Valor total da transferência", example = "100.00", required = true)
        private BigDecimal valorTotal;
        @Schema(description = "Número de parcelas", example = "1", required = true)
        private Integer quantidadeParcelas;
        @Schema(description = "Periodicidade entre parcelas em dias", example = "30", required = true)
        private Integer periodicidadeDias;
        @Schema(description = "Debitar primeira parcela imediatamente", example = "true")
        private boolean debitarPrimeiraParcela = false;
        @Schema(description = "Descrição da transferência", example = "Pagamento único")
        private String descricao;
        @Schema(description = "Data de início da transferência", example = "2025-07-07", required = true)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate dataInicio;
        public Long getContaDestinoId() { return contaDestinoId; }
        public void setContaDestinoId(Long contaDestinoId) { this.contaDestinoId = contaDestinoId; }
        public BigDecimal getValorTotal() { return valorTotal; }
        public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
        public Integer getQuantidadeParcelas() { return quantidadeParcelas; }
        public void setQuantidadeParcelas(Integer quantidadeParcelas) { this.quantidadeParcelas = quantidadeParcelas; }
        public Integer getPeriodicidadeDias() { return periodicidadeDias; }
        public void setPeriodicidadeDias(Integer periodicidadeDias) { this.periodicidadeDias = periodicidadeDias; }
        public LocalDate getDataInicio() { return dataInicio; }
        public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
        public boolean isDebitarPrimeiraParcela() { return debitarPrimeiraParcela; }
        public void setDebitarPrimeiraParcela(boolean debitarPrimeiraParcela) { this.debitarPrimeiraParcela = debitarPrimeiraParcela; }
        public String getDescricao() { return descricao; }
        public void setDescricao(String descricao) { this.descricao = descricao; }
    }
    @Schema(description = "Dados de um pagamento agendado para listagem")
    public static class PagamentoAgendadoDTO {
        @Schema(description = "ID do pagamento", example = "1")
        private Long id;
        @Schema(description = "ID da conta origem", example = "1")
        private Long contaOrigemId;
        @Schema(description = "ID da conta destino", example = "2")
        private Long contaDestinoId;
        @Schema(description = "Valor total", example = "150.00")
        private BigDecimal valorTotal;
        @Schema(description = "Valor da parcela", example = "50.00")
        private BigDecimal valorParcela;
        @Schema(description = "Quantidade de parcelas", example = "3")
        private Integer quantidadeParcelas;
        @Schema(description = "Parcelas restantes", example = "2")
        private Integer parcelasRestantes;
        @Schema(description = "Periodicidade em dias", example = "30")
        private Integer periodicidadeDias;
        @Schema(description = "Data da próxima execução", example = "2025-08-07")
        private LocalDate dataProximaExecucao;
        @Schema(description = "Status do pagamento", example = "ATIVO")
        private StatusAgendamento status;
        @Schema(description = "Descrição", example = "Transferência mensal")
        private String descricao;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getContaOrigemId() { return contaOrigemId; }
        public void setContaOrigemId(Long contaOrigemId) { this.contaOrigemId = contaOrigemId; }
        public Long getContaDestinoId() { return contaDestinoId; }
        public void setContaDestinoId(Long contaDestinoId) { this.contaDestinoId = contaDestinoId; }
        public BigDecimal getValorTotal() { return valorTotal; }
        public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
        public BigDecimal getValorParcela() { return valorParcela; }
        public void setValorParcela(BigDecimal valorParcela) { this.valorParcela = valorParcela; }
        public Integer getQuantidadeParcelas() { return quantidadeParcelas; }
        public void setQuantidadeParcelas(Integer quantidadeParcelas) { this.quantidadeParcelas = quantidadeParcelas; }
        public Integer getParcelasRestantes() { return parcelasRestantes; }
        public void setParcelasRestantes(Integer parcelasRestantes) { this.parcelasRestantes = parcelasRestantes; }
        public Integer getPeriodicidadeDias() { return periodicidadeDias; }
        public void setPeriodicidadeDias(Integer periodicidadeDias) { this.periodicidadeDias = periodicidadeDias; }
        public LocalDate getDataProximaExecucao() { return dataProximaExecucao; }
        public void setDataProximaExecucao(LocalDate dataProximaExecucao) { this.dataProximaExecucao = dataProximaExecucao; }
        public StatusAgendamento getStatus() { return status; }
        public void setStatus(StatusAgendamento status) { this.status = status; }
        public String getDescricao() { return descricao; }
        public void setDescricao(String descricao) { this.descricao = descricao; }
    }
    private PagamentoAgendadoDTO convertToDTO(PagamentoAgendado pagamento) {
        PagamentoAgendadoDTO dto = new PagamentoAgendadoDTO();
        dto.setId(pagamento.getId());
        dto.setContaOrigemId(pagamento.getContaOrigem().getId());
        dto.setContaDestinoId(pagamento.getContaDestino().getId());
        dto.setValorTotal(pagamento.getValorTotal());
        dto.setValorParcela(pagamento.getValorParcela());
        dto.setQuantidadeParcelas(pagamento.getQuantidadeParcelas());
        dto.setParcelasRestantes(pagamento.getParcelasRestantes());
        dto.setPeriodicidadeDias(pagamento.getPeriodicidadeDias());
        dto.setDataProximaExecucao(pagamento.getDataProximaExecucao());
        dto.setStatus(pagamento.getStatus());
        dto.setDescricao(pagamento.getDescricao());
        return dto;
    }
}
