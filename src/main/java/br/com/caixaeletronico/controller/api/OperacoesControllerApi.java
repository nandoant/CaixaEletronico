package br.com.caixaeletronico.controller.api;

import br.com.caixaeletronico.controller.OperacoesController;
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
 * Interface documentada para operações bancárias
 * 
 * Esta interface define os endpoints para operações de depósito e transferência
 * no sistema de caixa eletrônico.
 */
@Tag(name = "Operações Bancárias", description = "Operações de depósito e transferência")
@SecurityRequirement(name = "Bearer Authentication")
public interface OperacoesControllerApi {

    @Operation(
        summary = "Realizar depósito",
        description = "Realiza um depósito em dinheiro na conta especificada. " +
                     "O usuário deve informar as cédulas que está depositando para controle do estoque.",
        tags = {"Operações Bancárias"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Depósito realizado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Depósito realizado com sucesso",
                        "valor": 150.00
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
                        "error": "Conta não encontrada"
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
    @PostMapping("/deposito")
    ResponseEntity<?> depositar(
        @Parameter(description = "Dados do depósito", required = true,
                  schema = @Schema(implementation = OperacoesController.DepositoRequest.class,
                                 example = """
                                 {
                                     "contaId": 1,
                                     "valor": 150.00,
                                     "cedulas": {
                                         "CEM": 1,
                                         "CINQUENTA": 1
                                     }
                                 }
                                 """))
        @RequestBody OperacoesController.DepositoRequest request,
        
        Authentication authentication
    );

    @Operation(
        summary = "Realizar transferência",
        description = "Realiza uma transferência entre duas contas. " +
                     "O valor é debitado da conta de origem e creditado na conta de destino.",
        tags = {"Operações Bancárias"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Transferência realizada com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Transferência realizada com sucesso",
                        "valor": 200.00
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Saldo insuficiente ou contas inválidas",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Saldo insuficiente para realizar a transferência"
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
    @PostMapping("/transferencia")
    ResponseEntity<?> transferir(
        @Parameter(description = "Dados da transferência", required = true,
                  schema = @Schema(implementation = OperacoesController.TransferenciaRequest.class,
                                 example = """
                                 {
                                     "contaOrigemId": 1,
                                     "contaDestinoId": 2,
                                     "valor": 200.00
                                 }
                                 """))
        @RequestBody OperacoesController.TransferenciaRequest request,
        
        Authentication authentication
    );
}
