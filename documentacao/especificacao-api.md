# Especificação da API - Sistema Caixa Eletrônico

## Informações Gerais

- **Versão**: 1.0.0
- **Base URL**: `http://localhost:8080`
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticação**: JWT Bearer Token
- **Charset**: UTF-8

## Modelos de Dados

### Usuario
```json
{
  "id": "integer",
  "login": "string",
  "email": "string",
  "perfil": "enum [ADMIN, CLIENTE]",
  "dataCreacao": "datetime"
}
```

### Conta
```json
{
  "id": "integer",
  "titular": "string",
  "saldo": "decimal",
  "usuario": "Usuario",
  "dataCreacao": "datetime"
}
```

### Operacao
```json
{
  "id": "integer",
  "tipo": "enum [DEPOSITO, SAQUE, TRANSFERENCIA, PAGAMENTO_PARCELADO]",
  "valor": "decimal",
  "dataHora": "datetime",
  "descricao": "string",
  "conta": "Conta",
  "usuario": "Usuario"
}
```

### PagamentoAgendado
```json
{
  "id": "integer",
  "valorTotal": "decimal",
  "valorParcela": "decimal",
  "quantidadeParcelas": "integer",
  "parcelasRestantes": "integer",
  "periodicidadeDias": "integer",
  "dataProximaExecucao": "date",
  "status": "enum [ATIVO, CANCELADO, FINALIZADO]",
  "contaOrigem": "Conta"
}
```

### CombinacaoCedulas
```json
{
  "id": "uuid",
  "descricaoLegivel": "string",
  "mapaCedulas": {
    "DOIS": "integer",
    "CINCO": "integer",
    "DEZ": "integer",
    "VINTE": "integer",
    "CINQUENTA": "integer",
    "CEM": "integer",
    "DUZENTOS": "integer"
  }
}
```

## Endpoints da API

### Autenticação

#### POST /auth/register
Registra um novo usuário no sistema.

**Corpo da Requisição:**
```json
{
  "login": "string (obrigatório)",
  "email": "string (obrigatório)",
  "senha": "string (obrigatório)",
  "perfil": "enum [ADMIN, CLIENTE] (opcional, padrão: CLIENTE)"
}
```

**Respostas:**
- `200 OK`: Usuário registrado com sucesso
- `400 Bad Request`: Dados inválidos ou login já existe

#### POST /auth/login
Autentica um usuário e retorna token JWT.

**Corpo da Requisição:**
```json
{
  "login": "string (obrigatório)",
  "senha": "string (obrigatório)"
}
```

**Respostas:**
- `200 OK`: Login realizado com sucesso
- `400 Bad Request`: Credenciais inválidas

#### GET /auth/me
Retorna dados do usuário autenticado.

**Headers:**
- `Authorization: Bearer {token}`

**Respostas:**
- `200 OK`: Dados do usuário
- `401 Unauthorized`: Token inválido

### Operações Bancárias

#### POST /operacoes/deposito
Realiza depósito em dinheiro.

**Headers:**
- `Authorization: Bearer {token}`

**Corpo da Requisição:**
```json
{
  "contaId": "integer (obrigatório)",
  "valor": "decimal (obrigatório)",
  "cedulas": {
    "DOIS": "integer (opcional)",
    "CINCO": "integer (opcional)",
    "DEZ": "integer (opcional)",
    "VINTE": "integer (opcional)",
    "CINQUENTA": "integer (opcional)",
    "CEM": "integer (opcional)",
    "DUZENTOS": "integer (opcional)"
  }
}
```

**Respostas:**
- `200 OK`: Depósito realizado com sucesso
- `400 Bad Request`: Dados inválidos ou conta não encontrada
- `401 Unauthorized`: Token inválido

#### POST /operacoes/transferencia
Realiza transferência entre contas.

**Headers:**
- `Authorization: Bearer {token}`

**Corpo da Requisição:**
```json
{
  "contaOrigemId": "integer (obrigatório)",
  "contaDestinoId": "integer (obrigatório)",
  "valor": "decimal (obrigatório)"
}
```

**Respostas:**
- `200 OK`: Transferência realizada com sucesso
- `400 Bad Request`: Saldo insuficiente ou contas inválidas
- `401 Unauthorized`: Token inválido

### Operações de Saque

#### GET /operacoes/saque/opcoes
Obtém opções de combinações de cédulas para saque.

**Headers:**
- `Authorization: Bearer {token}`

**Parâmetros de Query:**
- `contaId`: integer (obrigatório)
- `valor`: integer (obrigatório, múltiplo de 10)

**Respostas:**
- `200 OK`: Opções de saque disponíveis
- `400 Bad Request`: Valor inválido ou sem opções disponíveis
- `401 Unauthorized`: Token inválido

#### POST /operacoes/saque
Confirma operação de saque.

**Headers:**
- `Authorization: Bearer {token}`

**Corpo da Requisição:**
```json
{
  "contaId": "integer (obrigatório)",
  "valor": "integer (obrigatório)",
  "idOpcao": "uuid (obrigatório)"
}
```

**Respostas:**
- `200 OK`: Saque realizado com sucesso
- `400 Bad Request`: Saldo insuficiente ou combinação inválida
- `401 Unauthorized`: Token inválido

### Consulta de Extrato

#### GET /contas/{id}/extrato
Obtém extrato bancário de uma conta.

**Headers:**
- `Authorization: Bearer {token}`

**Parâmetros de Path:**
- `id`: integer (obrigatório)

**Parâmetros de Query:**
- `dataInicio`: datetime (opcional, formato ISO 8601)
- `dataFim`: datetime (opcional, formato ISO 8601)
- `limite`: integer (opcional, padrão: 50)

**Respostas:**
- `200 OK`: Extrato da conta
- `400 Bad Request`: Conta não encontrada ou não autorizada
- `401 Unauthorized`: Token inválido

### Pagamentos Agendados

#### POST /pagamentos/agendar
Agenda um pagamento parcelado.

**Headers:**
- `Authorization: Bearer {token}`

**Corpo da Requisição:**
```json
{
  "contaId": "integer (obrigatório)",
  "valorTotal": "decimal (obrigatório)",
  "quantidadeParcelas": "integer (obrigatório, mínimo: 1)",
  "periodicidadeDias": "integer (obrigatório, mínimo: 1)",
  "dataInicio": "date (obrigatório, formato: YYYY-MM-DD)"
}
```

**Respostas:**
- `200 OK`: Pagamento agendado com sucesso
- `400 Bad Request`: Dados inválidos ou conta não encontrada
- `401 Unauthorized`: Token inválido

#### GET /pagamentos/{id}
Obtém detalhes de um pagamento agendado.

**Headers:**
- `Authorization: Bearer {token}`

**Parâmetros de Path:**
- `id`: integer (obrigatório)

**Respostas:**
- `200 OK`: Detalhes do pagamento
- `400 Bad Request`: Pagamento não encontrado ou não autorizado
- `401 Unauthorized`: Token inválido

#### GET /pagamentos/conta/{contaId}
Lista pagamentos agendados de uma conta.

**Headers:**
- `Authorization: Bearer {token}`

**Parâmetros de Path:**
- `contaId`: integer (obrigatório)

**Respostas:**
- `200 OK`: Lista de pagamentos
- `400 Bad Request`: Conta não encontrada ou não autorizada
- `401 Unauthorized`: Token inválido

#### POST /pagamentos/{id}/cancelar
Cancela um pagamento agendado.

**Headers:**
- `Authorization: Bearer {token}`

**Parâmetros de Path:**
- `id`: integer (obrigatório)

**Respostas:**
- `200 OK`: Pagamento cancelado com sucesso
- `400 Bad Request`: Pagamento não encontrado ou não autorizado
- `401 Unauthorized`: Token inválido

### Operações Administrativas (ADMIN)

#### POST /operacoes/desfazer
Desfaz a última operação bancária realizada.

**Headers:**
- `Authorization: Bearer {token}`

**Requisitos:**
- Token de usuário com perfil ADMIN

**Respostas:**
- `200 OK`: Operação desfeita com sucesso
- `400 Bad Request`: Não há operação para desfazer
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Perfil ADMIN requerido

## Códigos de Erro

### 400 Bad Request
Dados inválidos ou regras de negócio violadas.

**Exemplos:**
- `"Login já está em uso"`
- `"Saldo insuficiente para realizar o saque"`
- `"Conta não encontrada"`
- `"Valor deve ser múltiplo de 10"`
- `"Não é possível realizar saque no valor solicitado"`

### 401 Unauthorized
Token de autenticação inválido ou expirado.

**Exemplos:**
- `"Token inválido"`
- `"Token expirado"`
- `"Login ou senha incorretos"`

### 403 Forbidden
Acesso negado por falta de permissões.

**Exemplos:**
- `"Acesso negado - perfil ADMIN requerido"`
- `"Operação não autorizada"`

### 404 Not Found
Recurso não encontrado.

**Exemplos:**
- `"Endpoint não encontrado"`
- `"Recurso não existe"`

### 500 Internal Server Error
Erro interno do servidor.

**Exemplos:**
- `"Erro interno do servidor"`
- `"Falha na conexão com o banco de dados"`

## Validações

### Formato de Dados

#### Email
- Deve ser um endereço de email válido
- Formato: `usuario@dominio.com`

#### Senha
- Mínimo de 6 caracteres
- Deve conter pelo menos uma letra e um número

#### Datas
- Formato ISO 8601: `YYYY-MM-DDTHH:mm:ss`
- Datas de agendamento não podem ser no passado

#### Valores Monetários
- Formato decimal com até 2 casas decimais
- Valores positivos (exceto para histórico de operações)
- Saques devem ser múltiplos de 10

### Regras de Negócio

#### Operações Bancárias
- Saldo não pode ficar negativo
- Transferências entre contas do mesmo usuário são permitidas
- Valores mínimos e máximos podem ser aplicados

#### Pagamentos Agendados
- Quantidade mínima de parcelas: 1
- Periodicidade mínima: 1 dia
- Valor da parcela calculado automaticamente

#### Cédulas
- Denominações aceitas: R$ 2, R$ 5, R$ 10, R$ 20, R$ 50, R$ 100, R$ 200
- Estoque de cédulas é verificado antes de operações de saque

## Limitações

### Taxa de Requisições
- Não implementado rate limiting
- Recomendado máximo de 100 requisições por minuto por usuário

### Tamanho das Requisições
- Máximo de 1MB por requisição
- Limite de 1000 operações por consulta de extrato

### Concorrência
- Operações são thread-safe
- Transações garantem consistência
- Possível contenção em operações simultâneas na mesma conta

## Versionamento

### Versão Atual: 1.0.0
- Primeira versão estável da API
- Suporte completo a todas as funcionalidades documentadas

### Compatibilidade
- Mudanças breaking serão indicadas por incremento na versão major
- Novas funcionalidades incrementam a versão minor
- Correções de bugs incrementam a versão patch

## Monitoramento

### Logs
- Todas as operações são registradas
- Níveis: ERROR, WARN, INFO, DEBUG
- Rotação automática de logs

### Métricas
- Tempo de resposta das operações
- Taxa de sucesso/erro
- Uso de recursos do sistema

### Alertas
- Falhas de autenticação consecutivas
- Operações de alto valor
- Erros críticos do sistema
