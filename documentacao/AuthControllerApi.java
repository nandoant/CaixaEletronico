package br.com.caixaeletronico.documentacao;

import br.com.caixaeletronico.controller.AuthController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Interface documentada para operações de autenticação
 * 
 * Esta interface define os endpoints para registro, login e consulta de usuários
 * do sistema de caixa eletrônico.
 */
@Tag(name = "Autenticação", description = "Operações de autenticação e autorização")
public interface AuthControllerApi {

    @Operation(
        summary = "Registrar novo usuário",
        description = "Registra um novo usuário no sistema com login, email e senha. " +
                     "O perfil pode ser especificado (ADMIN/CLIENTE), caso contrário será CLIENTE por padrão.",
        tags = {"Autenticação"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Usuário registrado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "message": "Usuário registrado com sucesso",
                        "userId": 1,
                        "login": "usuario123",
                        "email": "usuario@email.com",
                        "perfil": "CLIENTE"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Erro de validação ou usuário já existe",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Login já está em uso"
                    }
                    """
                )
            )
        )
    })
    @PostMapping("/register")
    ResponseEntity<?> registrar(
        @Parameter(description = "Dados para registro do usuário", required = true)
        @Valid @RequestBody AuthController.RegistroRequest request
    );

    @Operation(
        summary = "Realizar login",
        description = "Autentica um usuário com login e senha, retornando um token JWT válido.",
        tags = {"Autenticação"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Login realizado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "type": "Bearer",
                        "userId": 1,
                        "login": "usuario123",
                        "email": "usuario@email.com",
                        "perfil": "CLIENTE"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Credenciais inválidas",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Login ou senha incorretos"
                    }
                    """
                )
            )
        )
    })
    @PostMapping("/login")
    ResponseEntity<?> login(
        @Parameter(description = "Credenciais de login", required = true)
        @Valid @RequestBody AuthController.LoginRequest request
    );

    @Operation(
        summary = "Obter dados do usuário logado",
        description = "Retorna os dados do usuário autenticado com base no token JWT fornecido.",
        tags = {"Autenticação"}
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Dados do usuário obtidos com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Object.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "userId": 1,
                        "login": "usuario123",
                        "email": "usuario@email.com",
                        "perfil": "CLIENTE"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Token inválido ou expirado",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "error": "Token inválido"
                    }
                    """
                )
            )
        )
    })
    @GetMapping("/me")
    ResponseEntity<?> obterUsuarioLogado(
        @Parameter(description = "Token JWT no formato 'Bearer {token}'", required = true)
        @RequestHeader("Authorization") String token
    );
}
