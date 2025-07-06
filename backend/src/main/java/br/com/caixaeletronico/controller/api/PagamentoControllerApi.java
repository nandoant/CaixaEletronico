package br.com.caixaeletronico.controller.api;

import br.com.caixaeletronico.controller.PagamentoController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Interface documentada para operações de pagamento agendado
 * 
 * Esta interface define os endpoints para agendar, consultar e cancelar
 * pagamentos parcelados no sistema de caixa eletrônico.
 */
@Tag(name = "Pagamentos", description = "Agendamento e controle de pagamentos parcelados")
@SecurityRequirement(name = "Bearer Authentication")
public interface PagamentoControllerApi {

    @Operation(
        summary = "Agendar pagamento parcelado",
        description = "Agenda um pagamento parcelado que será executado automaticamente nas datas especificadas. " +
                     "O sistema debita automaticamente o valor da parcela na data de execução.",
        tags = {"Pagamentos"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Pagamento agendado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Pagamento agendado com sucesso",
                        "id": 1,
                        "valorTotal": 1200.00,
                        "valorParcela": 200.00,
                        "quantidadeParcelas": 6,
                        "dataProximaExecucao": "2024-02-01",
                        "status": "ATIVO"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Dados inválidos ou conta não encontrada",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Conta não encontrada ou não autorizada"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Token de autenticação inválido",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Acesso negado"
                    }
                    """
                )
            )
        )
    })
    @PostMapping("/agendar")
    ResponseEntity<?> agendarPagamento(
        @Parameter(description = "Dados do pagamento a ser agendado", required = true,
                  schema = @Schema(implementation = PagamentoController.PagamentoRequest.class,
                                 example = """
                                 {
                                     "contaId": 1,
                                     "valorTotal": 1200.00,
                                     "quantidadeParcelas": 6,
                                     "periodicidadeDias": 30,
                                     "dataInicio": "2024-02-01"
                                 }
                                 """))
        @RequestBody PagamentoController.PagamentoRequest request,
        
        Authentication authentication
    );

    @Operation(
        summary = "Obter detalhes de um pagamento",
        description = "Retorna os detalhes de um pagamento agendado específico, incluindo status e parcelas restantes.",
        tags = {"Pagamentos"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Dados do pagamento obtidos com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "id": 1,
                        "valorTotal": 1200.00,
                        "valorParcela": 200.00,
                        "quantidadeParcelas": 6,
                        "parcelasRestantes": 4,
                        "periodicidadeDias": 30,
                        "dataProximaExecucao": "2024-04-01",
                        "status": "ATIVO"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Pagamento não encontrado ou não autorizado",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Pagamento não autorizado"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Token de autenticação inválido",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Acesso negado"
                    }
                    """
                )
            )
        )
    })
    @GetMapping("/{id}")
    ResponseEntity<?> obterPagamento(
        @Parameter(description = "ID do pagamento", required = true)
        @PathVariable Long id,
        
        Authentication authentication
    );

    @Operation(
        summary = "Listar pagamentos de uma conta",
        description = "Retorna todos os pagamentos agendados para uma conta específica.",
        tags = {"Pagamentos"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista de pagamentos obtida com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "contaId": 1,
                        "pagamentos": [
                            {
                                "id": 1,
                                "valorTotal": 1200.00,
                                "valorParcela": 200.00,
                                "quantidadeParcelas": 6,
                                "parcelasRestantes": 4,
                                "status": "ATIVO",
                                "dataProximaExecucao": "2024-04-01"
                            }
                        ]
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Conta não encontrada ou não autorizada",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Conta não encontrada ou não autorizada"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Token de autenticação inválido",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Acesso negado"
                    }
                    """
                )
            )
        )
    })
    @GetMapping("/conta/{contaId}")
    ResponseEntity<?> listarPagamentosPorConta(
        @Parameter(description = "ID da conta", required = true)
        @PathVariable Long contaId,
        
        Authentication authentication
    );

    @Operation(
        summary = "Cancelar pagamento",
        description = "Cancela um pagamento agendado. As parcelas já pagas não são revertidas.",
        tags = {"Pagamentos"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Pagamento cancelado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Pagamento cancelado com sucesso"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Pagamento não encontrado ou não autorizado",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Pagamento não autorizado"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Token de autenticação inválido",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Acesso negado"
                    }
                    """
                )
            )
        )
    })
    @PostMapping("/{id}/cancelar")
    ResponseEntity<?> cancelarPagamento(
        @Parameter(description = "ID do pagamento a ser cancelado", required = true)
        @PathVariable Long id,
        
        Authentication authentication
    );
}
