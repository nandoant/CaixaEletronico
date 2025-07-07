# Caixa Eletrônico - Backend Dockerizado

Sistema de Caixa Eletrônico desenvolvido com Spring Boot e PostgreSQL, executando em containers Docker.

## Pré-requisitos

- Docker
- Docker Compose
- Git (para clonar o repositório)

## Executando o Projeto

### 1. Executar com Docker Compose

```bash
# Navegar para o diretório do backend
cd backend

# Construir e executar os serviços
docker-compose up --build

# Ou para executar em background
docker-compose up -d --build
```

### 2. Verificar se os serviços estão rodando

```bash
# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### 3. Acessar a aplicação

- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

### 4. Conectar ao banco de dados

- **Host**: localhost
- **Porta**: 5432
- **Banco**: caixaeletronico
- **Usuário**: caixaeletronico
- **Senha**: caixaeletronico123

## Comandos Úteis

### Parar os serviços
```bash
docker-compose down
```

### Parar e remover volumes (limpar dados)
```bash
docker-compose down -v
```

### Recriar apenas o backend
```bash
docker-compose up -d --build backend
```

### Executar comandos no container
```bash
# Acessar o container do backend
docker-compose exec backend bash

# Acessar o container do PostgreSQL
docker-compose exec postgres psql -U caixaeletronico -d caixaeletronico
```

### Visualizar logs em tempo real
```bash
docker-compose logs -f
```

## Configurações de Ambiente

As seguintes variáveis de ambiente podem ser configuradas no arquivo `docker-compose.yml`:

- `DB_USERNAME`: Usuário do banco de dados
- `DB_PASSWORD`: Senha do banco de dados
- `JWT_SECRET`: Chave secreta para JWT
- `JWT_EXPIRATION`: Tempo de expiração do JWT
- `MAIL_HOST`: Servidor SMTP para envio de emails
- `MAIL_PORT`: Porta do servidor SMTP
- `MAIL_USERNAME`: Usuário do email
- `MAIL_PASSWORD`: Senha do email

## Estrutura do Projeto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── br/com/caixaeletronico/
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-docker.properties
│   │       └── templates/
│   └── test/
├── init-scripts/
│   └── 01-init.sql
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── pom.xml
```

## Troubleshooting

### Problema: Container não inicia
```bash
# Verificar logs
docker-compose logs backend

# Recriar containers
docker-compose down && docker-compose up --build
```

### Problema: Erro de conexão com banco
```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do PostgreSQL
docker-compose logs postgres
```

### Problema: Porta já está em uso
```bash
# Verificar processos usando a porta
netstat -ano | findstr :8080

# Matar processo (Windows)
taskkill /PID <PID> /F
```

## Desenvolvimento

Para desenvolvimento local com hot reload:

1. Mantenha apenas o PostgreSQL rodando:
```bash
docker-compose up -d postgres
```

2. Execute a aplicação Spring Boot localmente:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=docker
```

## Licença

Este projeto está licenciado sob a licença MIT.
