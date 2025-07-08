package br.com.caixaeletronico.controller.api;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
/**
 * Interface documentada para operações de desfazer (undo)
 * 
 * Esta interface define os endpoints para desfazer operações bancárias específicas.
 * Disponível apenas para usuários com perfil ADMIN.
 */
@Tag(name = "Desfazer Operações", description = "Operações para desfazer transações bancárias específicas (apenas ADMIN)")
@SecurityRequirement(name = "Bearer Authentication")
public interface UndoControllerApi {
    @Operation(
        summary = "Desfazer operação específica",
        description = "Desfaz uma operação bancária específica através do ID da operação e ID do usuário. " +
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
                        "message": "Operação 123 do usuário 456 desfeita com sucesso",
                        "operacaoId": 123,
                        "usuarioId": 456,
                        "adminResponsavel": "admin"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Operação não encontrada ou erro na operação",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Operação não encontrada ou já foi desfeita"
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
    @PostMapping("/{operacaoId}/usuario/{usuarioId}")
    ResponseEntity<?> desfazerOperacaoEspecifica(
            @Parameter(description = "ID da operação a ser desfeita", required = true)
            @PathVariable Long operacaoId,
            @Parameter(description = "ID do usuário proprietário da operação", required = true)
            @PathVariable Long usuarioId,
            Authentication authentication);
    @Operation(
        summary = "Listar operações de um usuário",
        description = "Lista todas as operações de um usuário específico. " +
                     "Esta funcionalidade está disponível apenas para usuários com perfil ADMIN.",
        tags = {"Desfazer Operações"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista de operações obtida com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "usuarioId": 456,
                        "operacoes": [
                            {
                                "id": 123,
                                "tipo": "DEPOSITO",
                                "valor": 1000.00,
                                "dataHora": "2024-01-15T10:30:00",
                                "desfeita": false
                            }
                        ],
                        "total": 1
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Usuário não encontrado",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Usuário não encontrado"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Token de autenticação inválido"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Acesso negado - perfil ADMIN requerido"
        )
    })
    @GetMapping("/usuario/{usuarioId}/operacoes")
    ResponseEntity<?> listarOperacoesUsuario(
            @Parameter(description = "ID do usuário", required = true)
            @PathVariable Long usuarioId,
            Authentication authentication);
}
