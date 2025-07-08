package br.com.caixaeletronico.controller.api;
import br.com.caixaeletronico.controller.SaqueController;
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
 * Interface documentada para operações de saque
 * 
 * Esta interface define os endpoints para obter opções de saque e confirmar operações
 * de saque no sistema de caixa eletrônico.
 */
@Tag(name = "Saque", description = "Operações de saque de dinheiro")
@SecurityRequirement(name = "Bearer Authentication")
public interface SaqueControllerApi {
    @Operation(
        summary = "Obter opções de saque",
        description = "Retorna as combinações de cédulas disponíveis para realizar um saque no valor especificado. " +
                     "Considera a disponibilidade de cédulas no caixa eletrônico.",
        tags = {"Saque"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Opções de saque obtidas com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "opcoes": [
                            {
                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                "descricaoLegivel": "2 notas de R$ 50,00",
                                "mapaCedulas": {
                                    "CINQUENTA": 2
                                }
                            },
                            {
                                "id": "550e8400-e29b-41d4-a716-446655440001",
                                "descricaoLegivel": "1 nota de R$ 100,00",
                                "mapaCedulas": {
                                    "CEM": 1
                                }
                            }
                        ],
                        "contaId": 1,
                        "valor": 100
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Valor inválido ou sem opções disponíveis",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Não é possível realizar saque no valor solicitado"
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
    @GetMapping("/opcoes")
    ResponseEntity<?> obterOpcoesSaque(
        @Parameter(description = "ID da conta para saque", required = true)
        @RequestParam Long contaId,
        @Parameter(description = "Valor do saque (deve ser múltiplo de 10)", required = true)
        @RequestParam int valor,
        Authentication authentication
    );
    @Operation(
        summary = "Confirmar saque",
        description = "Confirma a operação de saque com a combinação de cédulas selecionada. " +
                     "Debita o valor da conta e reduz o estoque de cédulas do caixa eletrônico.",
        tags = {"Saque"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Saque realizado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Saque realizado com sucesso",
                        "valor": 100,
                        "combinacao": "1 nota de R$ 100,00"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Saldo insuficiente ou combinação inválida",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Saldo insuficiente para realizar o saque"
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
    @PostMapping
    ResponseEntity<?> confirmarSaque(
        @Parameter(description = "Dados do saque a ser confirmado", required = true)
        @RequestBody SaqueController.SaqueRequest request,
        Authentication authentication
    );
}
