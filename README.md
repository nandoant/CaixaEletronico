# 🏦 Sistema Caixa Eletrônico - Full Stack

Sistema completo de caixa eletrônico com backend Spring Boot e frontend React.<br><br>
**Alunos**
- Fernando Antonio
- Michely Serras

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
  
## 🌐 URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Interface do usuário |
| Backend API | http://localhost:8080 | API REST |
| Swagger UI | http://localhost:8080/swagger-ui.html | Documentação da API |
| Banco de Dados | localhost:5432 | PostgreSQL |

## 📧 Configuração de Email

O sistema envia notificações por email para operações realizadas. Para configurar:

### 1. Configure o arquivo `.env`

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

### 2. Edite o arquivo `.env` com suas credenciais

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app-do-gmail
```

### 3. Para Gmail (Recomendado)

1. **Ative a autenticação de 2 fatores** na sua conta Google
2. **Gere uma senha de app**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App" → "Outro" → Digite "Caixa Eletrônico"
   - Use a senha gerada no `MAIL_PASSWORD`

### 4. Outros Provedores Suportados

| Provedor | Host | Porta |
|----------|------|-------|
| Gmail | smtp.gmail.com | 587 |
| Outlook | smtp-mail.outlook.com | 587 |
| Yahoo | smtp.mail.yahoo.com | 587 |

### 5. Validação

O sistema validará automaticamente as configurações na inicialização e exibirá logs informativos.

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
