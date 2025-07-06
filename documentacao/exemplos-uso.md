# Exemplos de Uso da API - Sistema Caixa Eletrônico

## Autenticação

### 1. Registrar Novo Usuário
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "login": "novousuario",
    "email": "novo@email.com",
    "senha": "senha123",
    "perfil": "CLIENTE"
  }'
```

**Resposta:**
```json
{
  "message": "Usuário registrado com sucesso",
  "userId": 3,
  "login": "novousuario",
  "email": "novo@email.com",
  "perfil": "CLIENTE"
}
```

### 2. Realizar Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "cliente",
    "senha": "cliente123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 2,
  "login": "cliente",
  "email": "cliente@email.com",
  "perfil": "CLIENTE"
}
```

### 3. Obter Dados do Usuário Logado
```bash
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Operações Bancárias

### 4. Obter Opções de Saque
```bash
curl -X GET "http://localhost:8080/operacoes/saque/opcoes?contaId=1&valor=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "opcoes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "descricaoLegivel": "1 nota de R$ 100,00",
      "mapaCedulas": {
        "CEM": 1
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "descricaoLegivel": "2 notas de R$ 50,00",
      "mapaCedulas": {
        "CINQUENTA": 2
      }
    }
  ],
  "contaId": 1,
  "valor": 100
}
```

### 5. Confirmar Saque
```bash
curl -X POST http://localhost:8080/operacoes/saque \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contaId": 1,
    "valor": 100,
    "idOpcao": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Resposta:**
```json
{
  "message": "Saque realizado com sucesso",
  "valor": 100,
  "combinacao": "1 nota de R$ 100,00"
}
```

### 6. Realizar Depósito
```bash
curl -X POST http://localhost:8080/operacoes/deposito \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contaId": 1,
    "valor": 150.00,
    "cedulas": {
      "CEM": 1,
      "CINQUENTA": 1
    }
  }'
```

**Resposta:**
```json
{
  "message": "Depósito realizado com sucesso",
  "valor": 150.00
}
```

### 7. Realizar Transferência
```bash
curl -X POST http://localhost:8080/operacoes/transferencia \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contaOrigemId": 1,
    "contaDestinoId": 2,
    "valor": 200.00
  }'
```

**Resposta:**
```json
{
  "message": "Transferência realizada com sucesso",
  "valor": 200.00
}
```

## Consulta de Extrato

### 8. Obter Extrato da Conta
```bash
curl -X GET "http://localhost:8080/contas/1/extrato?limite=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
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
```

### 9. Extrato por Período
```bash
curl -X GET "http://localhost:8080/contas/1/extrato?dataInicio=2024-01-01T00:00:00&dataFim=2024-01-31T23:59:59" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Pagamentos Agendados

### 10. Agendar Pagamento Parcelado
```bash
curl -X POST http://localhost:8080/pagamentos/agendar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contaId": 1,
    "valorTotal": 1200.00,
    "quantidadeParcelas": 6,
    "periodicidadeDias": 30,
    "dataInicio": "2024-02-01"
  }'
```

**Resposta:**
```json
{
  "message": "Pagamento agendado com sucesso",
  "id": 1,
  "valorTotal": 1200.00,
  "valorParcela": 200.00,
  "quantidadeParcelas": 6,
  "dataProximaExecucao": "2024-02-01",
  "status": "ATIVO"
}
```

### 11. Obter Detalhes do Pagamento
```bash
curl -X GET http://localhost:8080/pagamentos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
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
```

### 12. Listar Pagamentos da Conta
```bash
curl -X GET http://localhost:8080/pagamentos/conta/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 13. Cancelar Pagamento
```bash
curl -X POST http://localhost:8080/pagamentos/1/cancelar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "message": "Pagamento cancelado com sucesso"
}
```

## Operações Administrativas (ADMIN)

### 14. Desfazer Última Operação
```bash
curl -X POST http://localhost:8080/operacoes/desfazer \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Resposta:**
```json
{
  "message": "Operação desfeita com sucesso"
}
```

## Exemplos de Erro

### 15. Token Inválido
```bash
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer token_invalido"
```

**Resposta (401):**
```json
{
  "error": "Token inválido"
}
```

### 16. Saldo Insuficiente
```bash
curl -X POST http://localhost:8080/operacoes/saque \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contaId": 1,
    "valor": 10000,
    "idOpcao": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Resposta (400):**
```json
{
  "error": "Saldo insuficiente para realizar o saque"
}
```

### 17. Acesso Negado (Operação ADMIN)
```bash
curl -X POST http://localhost:8080/operacoes/desfazer \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN"
```

**Resposta (403):**
```json
{
  "error": "Acesso negado - perfil ADMIN requerido"
}
```

## Postman Collection

Para facilitar os testes, você pode importar a seguinte collection no Postman:

```json
{
  "info": {
    "name": "Caixa Eletrônico API",
    "description": "Collection para testes da API do Sistema Caixa Eletrônico"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}"
      }
    ]
  }
}
```

## Testando com JavaScript (Fetch API)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:8080/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login: 'cliente',
      senha: 'cliente123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
};

// Obter extrato
const getExtrato = async (contaId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8080/contas/${contaId}/extrato`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// Realizar saque
const realizarSaque = async (contaId, valor, idOpcao) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8080/operacoes/saque', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      contaId,
      valor,
      idOpcao
    })
  });
  
  return await response.json();
};
```

## Notas Importantes

1. **Substitua `YOUR_JWT_TOKEN`** pelo token real obtido no login
2. **IDs de contas e pagamentos** devem ser substituídos pelos valores reais
3. **Valores de saque** devem ser múltiplos de 10
4. **Datas** devem estar no formato ISO 8601
5. **Tokens JWT** têm validade limitada - renove quando necessário
