# Documentação da API - Sistema Caixa Eletrônico

## Visão Geral

Esta documentação descreve a API REST do Sistema de Caixa Eletrônico desenvolvido em Spring Boot. A API oferece funcionalidades completas para operações bancárias, incluindo autenticação, operações de saque, depósito, transferência, consulta de extratos e agendamento de pagamentos.

## Tecnologias Utilizadas

- **Spring Boot 3.2.0** - Framework principal
- **Spring Security** - Segurança e autenticação JWT
- **Spring Data JPA** - Persistência de dados
- **H2 Database** - Banco de dados em memória
- **Swagger/OpenAPI 3** - Documentação da API
- **FreeMarker** - Templates de email

## Padrões de Arquitetura

O sistema implementa os seguintes padrões de design:

1. **Command Pattern** - Para operações bancárias
2. **Strategy Pattern** - Para distribuição de cédulas
3. **Observer Pattern** - Para notificações por email
4. **Memento Pattern** - Para sistema de undo/desfazer

## Acesso à Documentação

### Swagger UI
A documentação interativa está disponível em:
```
http://localhost:8080/swagger-ui/index.html
```

### OpenAPI JSON
A especificação OpenAPI em formato JSON está disponível em:
```
http://localhost:8080/v3/api-docs
```

## Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para acessar endpoints protegidos:

1. Realize login no endpoint `/auth/login`
2. Utilize o token retornado no header `Authorization: Bearer {token}`

### Usuários de Teste

- **Admin**: `login=admin, senha=admin123`
- **Cliente**: `login=cliente, senha=cliente123`

## Endpoints Principais

### Autenticação (`/auth`)
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Realizar login
- `GET /auth/me` - Obter dados do usuário logado

### Operações Bancárias (`/operacoes`)
- `POST /operacoes/deposito` - Realizar depósito
- `POST /operacoes/transferencia` - Realizar transferência

### Saque (`/operacoes/saque`)
- `GET /operacoes/saque/opcoes` - Obter opções de saque
- `POST /operacoes/saque` - Confirmar saque

### Extrato (`/contas`)
- `GET /contas/{id}/extrato` - Obter extrato da conta

### Pagamentos (`/pagamentos`)
- `POST /pagamentos/agendar` - Agendar pagamento parcelado
- `GET /pagamentos/{id}` - Obter detalhes do pagamento
- `GET /pagamentos/conta/{contaId}` - Listar pagamentos da conta
- `POST /pagamentos/{id}/cancelar` - Cancelar pagamento

### Desfazer Operações (`/operacoes/desfazer`) - Apenas ADMIN
- `POST /operacoes/desfazer` - Desfazer última operação

## Estrutura das Respostas

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## Códigos de Status HTTP

- `200 OK` - Operação realizada com sucesso
- `400 Bad Request` - Dados inválidos ou erro de validação
- `401 Unauthorized` - Token inválido ou expirado
- `403 Forbidden` - Acesso negado (falta de permissão)
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro interno do servidor

## Validações e Regras de Negócio

### Operações de Saque
- Valores devem ser múltiplos de 10
- Saldo suficiente na conta
- Disponibilidade de cédulas no caixa

### Operações de Depósito
- Especificar cédulas depositadas
- Valores válidos conforme denominações aceitas

### Transferências
- Saldo suficiente na conta de origem
- Contas válidas e existentes
- Usuário deve ser proprietário da conta de origem

### Pagamentos Agendados
- Data de início não pode ser no passado
- Quantidade de parcelas mínima: 1
- Valor total deve ser positivo

## Segurança

### Autenticação JWT
- Tokens têm validade limitada
- Renovação automática não implementada
- Logout remove token do cliente (stateless)

### Autorização
- **CLIENTE**: Acesso às próprias contas e operações
- **ADMIN**: Acesso completo + funcionalidades administrativas

### Validações
- Entrada sanitizada e validada
- Proteção contra SQL Injection
- Validação de propriedade dos recursos

## Monitoramento e Logs

O sistema registra:
- Todas as operações bancárias
- Tentativas de autenticação
- Erros e exceções
- Operações administrativas

## Ambiente de Desenvolvimento

### H2 Console
Disponível em: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **User**: `sa`
- **Password**: (vazio)

### Dados de Teste
O sistema é inicializado com:
- 2 usuários de teste
- 2 contas bancárias
- Estoque inicial de cédulas
- Dados de exemplo para testes

## Configuração de Email

Para receber notificações por email, configure as propriedades:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=seu-email@gmail.com
spring.mail.password=sua-senha-de-app
```

## Considerações Importantes

1. **Ambiente de Desenvolvimento**: Sistema configurado para desenvolvimento, não para produção
2. **Banco de Dados**: H2 em memória - dados são perdidos ao reiniciar
3. **Cache**: Sistema usa cache em memória (sem Redis)
4. **Transações**: Todas as operações são transacionais
5. **Rollback**: Implementado para operações que falham

## Suporte

Para dúvidas ou problemas, consulte:
- Código fonte no repositório
- Logs da aplicação
- Documentação Swagger interativa
- Testes unitários e de integração
