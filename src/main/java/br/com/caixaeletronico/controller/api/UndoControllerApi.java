package br.com.caixaeletronico.controller.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Interface documentada para operações de desfazer (undo)
 * 
 * Esta interface define os endpoints para desfazer operações bancárias.
 * Disponível apenas para usuários com perfil ADMIN.
 */
@Tag(name = "Desfazer Operações", description = "Operações para desfazer transações bancárias (apenas ADMIN)")
@SecurityRequirement(name = "Bearer Authentication")
public interface UndoControllerApi {

    @Operation(
        summary = "Desfazer última operação",
        description = "Desfaz a última operação bancária realizada no sistema. " +
                     "Esta funcionalidade está disponível apenas para usuários com perfil ADMIN. " +
                     "O sistema utiliza o padrão Memento para restaurar o estado anterior das contas e do estoque de cédulas.",
        tags = {"Desfazer Operações"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Operação desfeita com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Operação desfeita com sucesso"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Não há operação para desfazer ou erro na operação",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Não há operação para desfazer"
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
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Acesso negado - perfil ADMIN requerido",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Acesso negado - perfil ADMIN requerido"
                    }
                    """
                )
            )
        )
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<?> desfazerUltimaOperacao(Authentication authentication);
}
