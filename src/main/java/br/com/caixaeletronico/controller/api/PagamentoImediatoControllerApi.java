package br.com.caixaeletronico.controller.api;

import br.com.caixaeletronico.controller.PagamentoImediatoController;
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
 * Interface documentada para pagamentos imediatos
 * 
 * Esta interface define os endpoints para realizar pagamentos e transferências
 * instantâneos no sistema de caixa eletrônico.
 */
@Tag(name = "Pagamentos Imediatos", description = "Pagamentos e transferências instantâneos")
@SecurityRequirement(name = "Bearer Authentication")
public interface PagamentoImediatoControllerApi {

    @Operation(
        summary = "Realizar pagamento imediato",
        description = "Realiza um pagamento ou transferência instantâneo. " +
                     "Para transferências, especifique a conta destino. " +
                     "Para outros tipos de pagamento, a conta destino é opcional.",
        tags = {"Pagamentos Imediatos"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Pagamento realizado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Pagamento realizado com sucesso",
                        "valor": 500.00,
                        "tipo": "Transferência",
                        "tipoOperacao": "Transferência entre contas"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Saldo insuficiente ou dados inválidos",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Saldo insuficiente"
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
    @PostMapping("/imediato")
    ResponseEntity<?> realizarPagamentoImediato(
        @Parameter(description = "Dados do pagamento imediato", required = true,
                  schema = @Schema(implementation = PagamentoImediatoController.PagamentoImediatoRequest.class,
                                 example = """
                                 {
                                     "contaOrigemId": 1,
                                     "contaDestinoId": 2,
                                     "valor": 500.00,
                                     "descricao": "Transferência entre contas",
                                     "tipo": "TRANSFERENCIA"
                                 }
                                 """))
        @RequestBody PagamentoImediatoController.PagamentoImediatoRequest request,
        
        Authentication authentication
    );
}
