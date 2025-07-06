package br.com.caixaeletronico.controller.api;

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
 * Interface documentada para operações de extrato
 * 
 * Esta interface define os endpoints para consulta de extratos bancários
 * no sistema de caixa eletrônico.
 */
@Tag(name = "Extrato", description = "Consulta de extratos bancários")
@SecurityRequirement(name = "Bearer Authentication")
public interface ExtratoControllerApi {

    @Operation(
        summary = "Obter extrato da conta",
        description = "Retorna o extrato bancário de uma conta específica. " +
                     "Pode filtrar por período (dataInicio/dataFim) ou limitar o número de operações. " +
                     "O usuário só pode consultar extratos de suas próprias contas.",
        tags = {"Extrato"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Extrato obtido com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "contaId": 1,
                        "titular": "João Silva",
                        "saldoAtual": 1250.50,
                        "operacoes": [
                            {
                                "id": 1,
                                "tipo": "DEPOSITO",
                                "valor": 500.00,
                                "dataHora": "2024-01-15T10:30:00",
                                "descricao": "Depósito em dinheiro"
                            },
                            {
                                "id": 2,
                                "tipo": "SAQUE",
                                "valor": -100.00,
                                "dataHora": "2024-01-14T14:20:00",
                                "descricao": "Saque no caixa eletrônico"
                            }
                        ],
                        "totalOperacoes": 2
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
    @GetMapping("/{id}/extrato")
    ResponseEntity<?> obterExtrato(
        @Parameter(description = "ID da conta para consulta do extrato", required = true)
        @PathVariable Long id,
        
        @Parameter(description = "Data de início para filtro (formato: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss ou dd/MM/yyyy)")
        @RequestParam(required = false) String dataInicio,
        
        @Parameter(description = "Data de fim para filtro (formato: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss ou dd/MM/yyyy)")
        @RequestParam(required = false) String dataFim,
        
        @Parameter(description = "Número máximo de operações a retornar (padrão: 50)")
        @RequestParam(required = false, defaultValue = "50") int limite,
        
        Authentication authentication
    );

    @Operation(
        summary = "Obter saldo da conta",
        description = "Retorna o saldo atual de uma conta específica. " +
                     "O usuário só pode consultar o saldo de suas próprias contas.",
        tags = {"Extrato"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Saldo obtido com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "contaId": 1,
                        "titular": "João Silva",
                        "saldo": 1250.50,
                        "dataConsulta": "2024-01-15T10:30:00"
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
    @GetMapping("/{id}/saldo")
    ResponseEntity<?> obterSaldo(
        @Parameter(description = "ID da conta para consulta do saldo", required = true)
        @PathVariable Long id,
        
        Authentication authentication
    );

    @Operation(
        summary = "Listar minhas contas",
        description = "Retorna todas as contas bancárias do usuário autenticado com seus respectivos saldos.",
        tags = {"Extrato"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Contas listadas com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "usuario": "cliente",
                        "contas": [
                            {
                                "id": 1,
                                "titular": "João Silva",
                                "saldo": 1250.50
                            },
                            {
                                "id": 2,
                                "titular": "João Silva - Poupança",
                                "saldo": 500.00
                            }
                        ]
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
    @GetMapping("/minhas-contas")
    ResponseEntity<?> listarMinhasContas(Authentication authentication);

    @Operation(
        summary = "Listar todas as contas (Admin)",
        description = "Retorna todas as contas bancárias do sistema. " +
                     "Apenas usuários com perfil de administrador podem acessar este endpoint.",
        tags = {"Extrato"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Contas listadas com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "usuario": "admin",
                        "perfil": "ADMIN",
                        "totalContas": 5,
                        "contas": [
                            {
                                "id": 1,
                                "titular": "João Silva",
                                "saldo": 1250.50,
                                "proprietario": "cliente1"
                            },
                            {
                                "id": 2,
                                "titular": "Maria Santos",
                                "saldo": 800.00,
                                "proprietario": "cliente2"
                            }
                        ]
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Acesso negado - apenas administradores",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Acesso negado: apenas administradores podem listar todas as contas"
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
    @GetMapping("/todas-contas")
    ResponseEntity<?> listarTodasContas(Authentication authentication);
}
