# Exemplos de Uso da Nova Funcionalidade

## Cenário de Teste

### 1. Listar Operações de um Usuário

**Requisição:**
```http
GET /operacoes/desfazer/usuario/123/operacoes
Authorization: Bearer <token_admin>
```

**Resposta:**
```json
{
    "usuarioId": 123,
    "operacoes": [
        {
            "id": 456,
            "tipo": "DEPOSITO",
            "valor": 1000.00,
            "dataHora": "2025-01-15T10:30:00",
            "desfeita": false,
            "contaOrigem": {
                "id": 1,
                "numero": "12345-6"
            },
            "usuarioResponsavel": "joao.silva"
        },
        {
            "id": 457,
            "tipo": "SAQUE",
            "valor": 500.00,
            "dataHora": "2025-01-15T11:00:00",
            "desfeita": false,
            "contaOrigem": {
                "id": 1,
                "numero": "12345-6"
            },
            "usuarioResponsavel": "joao.silva"
        }
    ],
    "total": 2
}
```

### 2. Desfazer Operação Específica

**Requisição:**
```http
POST /operacoes/desfazer/456/usuario/123
Authorization: Bearer <token_admin>
```

**Resposta de Sucesso:**
```json
{
    "message": "Operação 456 do usuário 123 desfeita com sucesso",
    "operacaoId": 456,
    "usuarioId": 123,
    "adminResponsavel": "admin"
}
```

### 3. Tentativa de Desfazer Operação Já Desfeita

**Requisição:**
```http
POST /operacoes/desfazer/456/usuario/123
Authorization: Bearer <token_admin>
```

**Resposta de Erro:**
```json
{
    "error": "Operação já foi desfeita anteriormente"
}
```

### 4. Tentativa de Desfazer sem Ser Admin

**Requisição:**
```http
POST /operacoes/desfazer/456/usuario/123
Authorization: Bearer <token_cliente>
```

**Resposta de Erro:**
```json
{
    "error": "Acesso negado - perfil ADMIN requerido"
}
```

## Fluxo de Trabalho Recomendado

### Para Administradores:

1. **Identificar o usuário**: Obter o ID do usuário através do sistema de gestão
2. **Listar operações**: Usar o endpoint `GET /operacoes/desfazer/usuario/{usuarioId}/operacoes`
3. **Identificar a operação**: Encontrar a operação específica que precisa ser desfeita
4. **Desfazer operação**: Usar o endpoint `POST /operacoes/desfazer/{operacaoId}/usuario/{usuarioId}`
5. **Verificar resultado**: Confirmar que a operação foi desfeita com sucesso

### Exemplo de Uso com cURL:

```bash
# 1. Listar operações do usuário 123
curl -X GET "http://localhost:8080/operacoes/desfazer/usuario/123/operacoes" \
  -H "Authorization: Bearer seu_token_admin"

# 2. Desfazer operação 456 do usuário 123
curl -X POST "http://localhost:8080/operacoes/desfazer/456/usuario/123" \
  -H "Authorization: Bearer seu_token_admin"
```

## Casos de Erro Comuns

### 1. Operação Não Encontrada
```json
{
    "error": "Operação não encontrada ou já foi desfeita"
}
```

### 2. Usuário Não Encontrado
```json
{
    "error": "Usuário não encontrado"
}
```

### 3. Operação Sem Memento
```json
{
    "error": "Operação não pode ser desfeita - memento não disponível"
}
```

### 4. Acesso Negado
```json
{
    "error": "Apenas administradores podem desfazer operações específicas"
}
```

## Validações Implementadas

1. **Autorização**: Verifica se o usuário tem perfil ADMIN
2. **Existência do Usuário**: Confirma que o usuário alvo existe
3. **Existência da Operação**: Verifica se a operação existe e pertence ao usuário
4. **Estado da Operação**: Confirma que a operação não foi desfeita anteriormente
5. **Disponibilidade do Memento**: Verifica se a operação pode ser desfeita
