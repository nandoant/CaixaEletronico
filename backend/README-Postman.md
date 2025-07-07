# Caixa Eletrônico - Testes Automatizados com Postman

Este diretório contém arquivos para testar a API do Caixa Eletrônico usando o Postman com **execução automatizada completa**.

## 🚀 Funcionalidades Principais

- **Execução Automatizada**: Todos os endpoints podem ser executados em sequência
- **Dados Dinâmicos**: Gera usuários, emails e IDs automaticamente
- **Testes Inteligentes**: Cada endpoint tem testes que verificam a resposta
- **Salvamento Automático**: Tokens, IDs e dados são salvos automaticamente
- **Feedback Visual**: Logs coloridos com status de cada teste

## Arquivos

- `CaixaEletronico_Postman_Collection.json` - Coleção completa com testes automatizados
- `CaixaEletronico_Environment.json` - Ambiente com variáveis configuradas
- `README-Postman.md` - Esta documentação

## 🎯 Como Executar Todos os Testes

### 1. Importar no Postman

1. Abra o Postman
2. Clique em **Import**
3. Selecione os arquivos: `CaixaEletronico_Postman_Collection.json` e `CaixaEletronico_Environment.json`

### 2. Executar Toda a Coleção

1. **Método 1 - Runner do Postman:**
   - Clique com botão direito na coleção "Caixa Eletrônico API"
   - Escolha **"Run collection"**
   - Clique em **"Run Caixa Eletrônico API"**
   - Todos os testes serão executados automaticamente!

2. **Método 2 - Executar individualmente:**
   - Execute na ordem recomendada (veja seção abaixo)

### 3. Configurar o Ambiente

- No canto superior direito, selecione **"Caixa Eletrônico - Ambiente Local"**
- Certifique-se de que a aplicação esteja rodando em `http://localhost:8080`

## 📋 Ordem de Execução Automática

Quando você executar a coleção completa, os testes seguem esta ordem:

### 🔐 1. Autenticação
- ✅ Registra usuário com dados dinâmicos
- ✅ Registra admin com dados dinâmicos  
- ✅ Faz login do usuário (salva token automaticamente)
- ✅ Faz login do admin (salva token de admin)
- ✅ Obtém dados do usuário logado
- ✅ Lista contas disponíveis (salva IDs das contas)

### 💰 2. Operações Bancárias
- ✅ Realiza depósito de R$ 500,00
- ✅ Realiza transferência de R$ 100,00 (entre contas)

### 🏧 3. Operações de Saque
- ✅ Obtém opções de saque de R$ 200,00
- ✅ Confirma saque (usando opção salva automaticamente)

### 📅 4. Pagamentos
- ✅ Agenda pagamento parcelado de R$ 150,00
- ✅ Consulta pagamento criado (usando ID salvo)
- ✅ Lista pagamentos da conta
- ✅ Cancela pagamento (usando ID salvo)

### 📊 5. Extratos
- ✅ Obtém extrato da conta (salva ID da primeira operação)
- ✅ Obtém extrato por período

### 📦 6. Estoque
- ✅ Consulta estoque global de cédulas

### 👨‍💼 7. Operações Administrativas
- ✅ Lista operações do usuário (como admin)
- ✅ Desfaz operação específica (como admin)

## 🎯 Testes Automatizados Incluídos

Cada endpoint tem testes que verificam:
- ✅ Status da resposta (200 OK)
- ✅ Estrutura da resposta (propriedades esperadas)
- ✅ Salvamento automático de dados importantes
- ✅ Logs detalhados no console

## 📊 Resultados dos Testes

Após executar, você verá:
- **Verde**: Testes passaram ✅
- **Vermelho**: Testes falharam ❌
- **Console**: Logs detalhados de cada operação

## Variáveis Automáticas

A coleção está configurada para salvar automaticamente:
- `authToken` - Token de autenticação (após login)
- `adminToken` - Token de admin (quando fizer login como admin)
- `userId` - ID do usuário logado
- `contaId` - ID da primeira conta disponível

## 🔧 Sistema Automático de Tokens

### Como Funciona:
1. **Faça Login**: Execute o endpoint "3. Login" ou "3.1. Login Admin"
2. **Token Salvo**: O token é automaticamente salvo nas variáveis
3. **Uso Automático**: Todas as outras requisições usam o token automaticamente
4. **Feedback Visual**: Veja os logs no console do Postman:
   - ✅ Sucesso
   - ❌ Erro
   - ⚠️ Aviso

### Logs no Console:
Após fazer login, você verá:
```
✅ Token salvo automaticamente: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ User ID salvo: 1
✅ Login realizado com sucesso!
```

### Duplo Salvamento:
O sistema salva tanto em:
- **Variáveis de Coleção** - Para uso na própria coleção
- **Variáveis de Ambiente** - Para uso em outras coleções

## Exemplos de Dados

### Perfis de Usuário
- `CLIENTE` - Usuário comum
- `ADMIN` - Administrador com permissões especiais

### Valores de Cédulas para Depósito
```json
{
  "DOIS": 2,
  "CINCO": 5,
  "DEZ": 10,
  "VINTE": 20,
  "CINQUENTA": 50,
  "CEM": 100,
  "DUZENTOS": 200
}
```

### Exemplo de Depósito
```json
{
  "contaId": 1,
  "valor": 100.00,
  "cedulas": {
    "CINQUENTA": 1,
    "VINTE": 2,
    "DEZ": 1
  }
}
```

### Exemplo de Transferência
```json
{
  "contaOrigemId": 1,
  "contaDestinoId": 2,
  "valor": 50.00
}
```

### Exemplo de Pagamento Agendado
```json
{
  "contaId": 1,
  "valorTotal": 300.00,
  "quantidadeParcelas": 3,
  "periodicidadeDias": 30,
  "dataInicio": "2025-07-08",
  "debitarPrimeiraParcela": true
}
```

## Dicas

1. **Token de Autenticação**: Após fazer login, o token é salvo automaticamente e usado em todas as outras requisições
2. **IDs Automáticos**: O ID da conta é salvo automaticamente ao listar contas disponíveis
3. **Ordem de Execução**: Siga a ordem recomendada para evitar erros de dependência
4. **Permissões**: Algumas operações (como desfazer) são apenas para ADMINs
5. **Saldo**: Certifique-se de ter saldo suficiente antes de fazer transferências ou saques

## Troubleshooting

### Problemas com Token:
- **Token não salvou**: Verifique se o login retornou status 200
- **Token inválido**: Faça login novamente, tokens podem expirar
- **Variável vazia**: Verifique se selecionou o ambiente correto

### Outros Problemas:
- Se receber erro 401 (Unauthorized), verifique se o token está válido
- Se receber erro 404, verifique se os IDs estão corretos
- Se receber erro 400, verifique se os dados do body estão corretos
- Certifique-se de que a aplicação esteja rodando antes de fazer os testes

### Verificar Variáveis:
1. Clique no ícone de "olho" 👁️ no canto superior direito
2. Veja se `authToken` tem valor
3. Se estiver vazio, refaça o login

## Ambiente de Desenvolvimento

Para executar a aplicação:
```bash
# No diretório backend
./manage.ps1 dev
```

A aplicação estará disponível em `http://localhost:8080`
