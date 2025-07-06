package br.com.caixaeletronico.controller.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

/**
 * Interface documentada para operações de consulta do estoque global
 * 
 * Esta interface define os endpoints para consultar o estoque de cédulas
 * disponíveis no caixa eletrônico.
 */
@Tag(name = "Estoque Global", description = "Consulta do estoque global de cédulas")
@SecurityRequirement(name = "Bearer Authentication")
public interface EstoqueGlobalControllerApi {

    @Operation(
        summary = "Consultar estoque global de cédulas",
        description = "Retorna o estoque atual de todas as cédulas disponíveis no caixa eletrônico. " +
                     "Este é o estoque físico compartilhado por todos os usuários do sistema.",
        tags = {"Estoque Global"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Estoque consultado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "estoque": [
                            {
                                "id": 1,
                                "valorCedula": "DUZENTOS",
                                "quantidade": 100
                            },
                            {
                                "id": 2,
                                "valorCedula": "CEM",
                                "quantidade": 200
                            },
                            {
                                "id": 3,
                                "valorCedula": "CINQUENTA",
                                "quantidade": 400
                            },
                            {
                                "id": 4,
                                "valorCedula": "VINTE",
                                "quantidade": 1000
                            },
                            {
                                "id": 5,
                                "valorCedula": "DEZ",
                                "quantidade": 2000
                            },
                            {
                                "id": 6,
                                "valorCedula": "CINCO",
                                "quantidade": 4000
                            },
                            {
                                "id": 7,
                                "valorCedula": "DOIS",
                                "quantidade": 10000
                            }
                        ],
                        "totalCedulas": 17700,
                        "valorTotalDisponivel": 118000
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Não autorizado - Token de acesso inválido ou ausente",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Token de acesso inválido"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Erro interno do servidor",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Erro interno do servidor"
                    }
                    """
                )
            )
        )
    })
    ResponseEntity<?> consultarEstoqueGlobal();
}
