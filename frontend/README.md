# Caixa Eletrônico - Frontend React

Este é o frontend da aplicação de Caixa Eletrônico, desenvolvido em React com TypeScript e Material-UI.

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Material-UI (MUI)** para componentes visuais
- **React Router** para navegação
- **React Query** para gerenciamento de estado e cache
- **React Hook Form** para formulários
- **Axios** para requisições HTTP

## 🏗️ Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── layout/          # Layout principal (Navbar, Sidebar)
│   └── common/          # Componentes comuns (Loading, etc)
├── pages/               # Páginas da aplicação
│   ├── auth/           # Login e Registro
│   ├── dashboard/      # Dashboard principal
│   ├── operacoes/      # Saque, Depósito, Transferência
│   ├── consultas/      # Extrato, Saldo
│   ├── agendamentos/   # Pagamentos agendados
│   └── admin/          # Área administrativa
├── contexts/           # Context API (AuthContext)
├── routes/             # Configuração de rotas
└── services/           # Serviços de API (a implementar)
```

## 🚀 Como Executar

### Com Docker (Recomendado)

1. **Desenvolvimento** (com hot reload):
```bash
docker-compose -f docker-compose.dev.yml up frontend
```

2. **Produção**:
```bash
docker-compose up frontend
```

### Sem Docker

1. **Instalar dependências**:
```bash
cd frontend
npm install
```

2. **Executar em desenvolvimento**:
```bash
npm start
```

3. **Build para produção**:
```bash
npm run build
```

## 🔧 Configuração

### Variáveis de Ambiente

- **REACT_APP_API_URL**: URL do backend (padrão: http://localhost:8080)
- **REACT_APP_ENV**: Ambiente da aplicação (development/production)

### Arquivos de Configuração

- `.env.development` - Variáveis para desenvolvimento
- `.env.production` - Variáveis para produção

## 📱 Funcionalidades Implementadas (Esqueleto)

### ✅ Estrutura Base
- [x] Configuração inicial do React
- [x] Material-UI setup
- [x] Sistema de rotas
- [x] Context de autenticação
- [x] Layout responsivo com Navbar e Sidebar
- [x] Páginas base para todas as funcionalidades

### 🔄 Próximos Passos
- [ ] Implementar serviços de API
- [ ] Conectar com endpoints do backend
- [ ] Implementar formulários funcionais
- [ ] Adicionar validações
- [ ] Implementar estado global
- [ ] Adicionar tratamento de erros
- [ ] Implementar notificações
- [ ] Testes unitários

## 🎯 Páginas Disponíveis

1. **Login/Registro** (`/login`, `/register`)
2. **Dashboard** (`/dashboard`) - Visão geral da conta
3. **Operações** (`/operacoes`) - Saque, Depósito, Transferência
4. **Extrato** (`/extrato`) - Histórico de operações
5. **Saldo** (`/saldo`) - Consulta de saldo
6. **Agendamentos** (`/agendamentos`) - Pagamentos agendados
7. **Admin** (`/admin`) - Área administrativa (apenas admins)

## 🔗 Integração com Backend

O frontend está preparado para consumir os seguintes endpoints:

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Dados do usuário
- `POST /operacoes/saque` - Saque
- `POST /operacoes/deposito` - Depósito
- `POST /operacoes/transferencia` - Transferência
- `GET /contas/{id}/extrato` - Extrato
- `GET /contas/{id}/saldo` - Saldo
- `POST /pagamentos/agendar` - Agendar pagamento
- E mais...

## 🐳 Docker

### Desenvolvimento
```bash
# Executar apenas o frontend
docker-compose -f docker-compose.dev.yml up frontend

# Executar tudo (backend + frontend + banco)
docker-compose -f docker-compose.dev.yml up
```

### Produção
```bash
# Build e execução
docker-compose up --build
```

## 📝 Notas de Desenvolvimento

- O esqueleto está funcional mas sem integração real com APIs
- Autenticação usa mock temporário
- Todas as páginas retornam dados estáticos
- Material-UI configurado com tema personalizado
- Responsive design implementado
- TypeScript configurado com strict mode

## 🔧 Comandos Úteis

```bash
# Instalar nova dependência
npm install <package>

# Executar testes
npm test

# Verificar TypeScript
npm run type-check

# Executar linting
npm run lint

# Build para produção
npm run build
```
