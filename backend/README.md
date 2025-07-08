# Sistema de Caixa Eletrônico

## 📋 Funcionalidades

- **Autenticação e Autorização**
  - Registro e login de usuários
  - Autenticação via JWT
  - Controle de acesso por perfil (ADMIN/CLIENTE)

- **Operações Bancárias**
  - Depósito com controle de cédulas
  - Saque com múltiplas opções de combinações
  - Transferência entre contas
  - Pagamentos agendados com parcelas

- **Gestão de Cédulas**
  - Controle de estoque por tipo de cédula
  - Estratégias de distribuição de notas
  - Otimização de combinações

- **Recursos Avançados**
  - Padrão Command para operações
  - Sistema de desfazer (undo) para administradores
  - Notificações por email
  - Extrato de operações
  - Agendamento de pagamentos

## 🚀 Tecnologias Utilizadas

- **Spring Boot 3.2.0**
- **Spring Security** (JWT)
- **Spring Data JPA**
- **Maven**
- **FreeMarker** (templates de email)
- **Jackson** (serialização JSON)

## 📦 Estrutura do Projeto

```
src/main/java/br/com/caixaeletronico/
├── model/           # Entidades JPA, VOs e Enums
├── repository/      # Repositories Spring Data JPA
├── service/         # Lógica de negócio
├── command/         # Padrão Command
├── strategy/        # Padrão Strategy
├── event/           # Sistema de eventos
├── controller/      # Controllers REST
└── config/          # Configurações
```

## 🔧 Configuração e Execução

### Pré-requisitos
- Java 17+
- Maven 3.6+

### Executando o projeto

1. Clone o repositório
2. Execute o comando:
```bash
mvn spring-boot:run
```

3. Acesse: http://localhost:8080

## 📊 Dados de Teste

O sistema cria automaticamente dados iniciais:

**Usuário Admin:**
- Login: `admin`
- Senha: `admin123`
- Email: `admin@caixaeletronico.com`

**Usuário Cliente:**
- Login: `cliente`
- Senha: `cliente123`
- Email: `cliente@email.com`

**Contas:**
- Conta 1: João Silva (ID: 1) - R$ 5.000,00
- Conta 2: Maria Santos (ID: 2) - R$ 3.000,00

## 🛠️ API Endpoints

### Autenticação
```
POST /auth/register   # Registrar usuário
POST /auth/login      # Login
GET  /auth/me         # Dados do usuário logado
```

### Operações
```
GET  /operacoes/saque/opcoes    # Obter opções de saque
POST /operacoes/saque           # Confirmar saque
POST /operacoes/deposito        # Realizar depósito
POST /operacoes/transferencia   # Transferir valores
POST /operacoes/desfazer        # Desfazer operação (ADMIN)
```

### Extrato
```
GET /contas/{id}/extrato        # Obter extrato da conta
```

### Pagamentos
```
POST /pagamentos/agendar        # Agendar pagamento
GET  /pagamentos/{id}           # Obter pagamento
GET  /pagamentos/conta/{id}     # Listar pagamentos da conta
POST /pagamentos/{id}/cancelar  # Cancelar pagamento
```

## 🔐 Autenticação

Todas as rotas (exceto `/auth/**`) requerem autenticação via JWT.

**Headers necessários:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

## 💡 Alguns Padrões Implementados

### Command Pattern
- `DepositoCommand`
- `SaqueCommand`
- `TransferenciaCommand`
- `PaymentInstallmentCommand`

### Strategy Pattern
- `BigNotesFirstStrategy`
- `SmallNotesFirstStrategy`
- `IntermediateNotesStrategy`

### Observer Pattern
- `OperationCompletedEvent`
- `EmailNotificationService`

### Memento Pattern
- `OperationMemento` - Para sistema de undo

## 📧 Configuração de Email

Para usar o sistema de notificações por email, configure as propriedades:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=seu-email@gmail.com
spring.mail.password=sua-senha-app
```

## 🔄 Jobs Agendados

- **Processamento de Pagamentos**: Executa a cada hora
- **Limpeza de Dados**: Executa diariamente às 01:00

## 📝 Exemplos de Uso

### 1. Registro de Usuário
```json
POST /auth/register
{
    "login": "usuario",
    "email": "usuario@email.com",
    "senha": "senha123",
    "perfil": "CLIENTE"
}
```

### 2. Login
```json
POST /auth/login
{
    "login": "cliente",
    "senha": "cliente123"
}
```

### 3. Obter Opções de Saque
```
GET /operacoes/saque/opcoes?contaId=1&valor=300
```

### 4. Confirmar Saque
```json
POST /operacoes/saque
{
    "contaId": 1,
    "valor": 300,
    "idOpcao": "uuid-da-opcao"
}
```

### 5. Realizar Depósito
```json
POST /operacoes/deposito
{
    "contaId": 1,
    "valor": 500.00,
    "cedulas": {
        "DUZENTOS": 2,
        "CEM": 1
    }
}
```
