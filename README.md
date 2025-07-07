# 🏦 Sistema Caixa Eletrônico - Full Stack

Sistema completo de caixa eletrônico com backend Spring Boot e frontend React.

## 📁 Estrutura do Projeto

```
CaixaEletronico/
├── backend/                 # API Spring Boot
│   ├── src/                # Código fonte Java
│   ├── Dockerfile          # Docker para backend
│   └── README.md           # Documentação do backend
├── frontend/               # Interface React
│   ├── src/               # Código fonte React/TypeScript
│   ├── Dockerfile         # Docker para frontend
│   └── README.md          # Documentação do frontend
├── docker-compose.yml     # Produção
├── docker-compose.dev.yml # Desenvolvimento
├── start.sh              # Script Linux/Mac
└── start.bat             # Script Windows
```

## 🚀 Execução Rápida

### Windows
```bash
# Aplicação completa
start.bat full

# Apenas frontend (desenvolvimento)
start.bat dev

# Apenas frontend (produção)
start.bat prod
```

### Linux/Mac
```bash
# Dar permissão ao script
chmod +x start.sh

# Aplicação completa
./start.sh full

# Apenas frontend (desenvolvimento)
./start.sh dev

# Apenas frontend (produção)
./start.sh prod
```

## 🛠️ Stack Tecnológica

### Backend
- **Java 17** + **Spring Boot 3**
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Spring Security** para segurança
- **Swagger** para documentação da API

### Frontend
- **React 18** + **TypeScript**
- **Material-UI** para interface
- **React Router** para navegação
- **React Query** para gerenciamento de estado
- **Axios** para requisições HTTP

## 📊 Funcionalidades

### ✅ Backend (Implementado)
- [x] Autenticação JWT
- [x] CRUD de usuários e contas
- [x] Operações financeiras (saque, depósito, transferência)
- [x] Consulta de extrato e saldo
- [x] Agendamento de pagamentos
- [x] Estratégias de distribuição de cédulas
- [x] Desfazer operações
- [x] Área administrativa
- [x] Notificações por email

### 🔄 Frontend (Esqueleto Criado)
- [x] Estrutura base com rotas
- [x] Autenticação (mock)
- [x] Layout responsivo
- [x] Páginas para todas as funcionalidades
- [ ] Integração real com APIs
- [ ] Formulários funcionais
- [ ] Gerenciamento de estado
- [ ] Tratamento de erros

## 🌐 URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Interface do usuário |
| Backend API | http://localhost:8080 | API REST |
| Swagger UI | http://localhost:8080/swagger-ui.html | Documentação da API |
| Banco de Dados | localhost:5432 | PostgreSQL |

## 🔧 Desenvolvimento

### Pré-requisitos
- **Docker** e **Docker Compose**
- **Git**

### Primeira Execução
```bash
# Clonar o repositório
git clone <repository-url>
cd CaixaEletronico

# Executar aplicação completa
# Windows:
start.bat full

# Linux/Mac:
chmod +x start.sh
./start.sh full
```

### Comandos Docker Manuais

```bash
# Desenvolvimento (hot reload)
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose up

# Rebuild forçado
docker-compose up --build

# Apenas banco de dados
docker-compose up postgres

# Apenas backend
docker-compose up backend

# Apenas frontend
docker-compose up frontend
```

## 📝 Status do Projeto

### ✅ Concluído
- [x] Backend completamente funcional
- [x] Estrutura do frontend
- [x] Configuração Docker
- [x] Scripts de inicialização

### 🔄 Em Desenvolvimento
- [ ] Integração frontend-backend
- [ ] Implementação dos formulários
- [ ] Validações do frontend
- [ ] Testes automatizados

### 📋 Próximos Passos
1. **Conectar frontend com backend**
   - Implementar serviços de API
   - Configurar interceptors do Axios
   - Gerenciar tokens JWT

2. **Implementar funcionalidades**
   - Formulários de operações
   - Consultas em tempo real
   - Notificações

3. **Melhorias de UX**
   - Loading states
   - Error handling
   - Confirmações de ações

4. **Testes e qualidade**
   - Testes unitários
   - Testes de integração
   - Linting e formatação

## 🐳 Docker

### Variáveis de Ambiente

#### Backend
- `SPRING_PROFILES_ACTIVE=docker`
- `DB_USERNAME=caixaeletronico`
- `DB_PASSWORD=caixaeletronico123`
- `JWT_SECRET=sua-chave-secreta`

#### Frontend
- `REACT_APP_API_URL=http://localhost:8080`
- `REACT_APP_ENV=development`

### Volumes
- `postgres_data`: Dados persistentes do PostgreSQL
- Hot reload para desenvolvimento

## 📖 Documentação Adicional

- [Backend README](./backend/README.md) - Documentação detalhada da API
- [Frontend README](./frontend/README.md) - Documentação do React app

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
