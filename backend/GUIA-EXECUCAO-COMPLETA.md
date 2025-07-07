# 🚀 Guia de Execução Completa - Caixa Eletrônico API

## Como Executar TODOS os Testes Automaticamente

### 1. Preparação

1. **Inicie a aplicação**:
   ```bash
   cd backend
   ./manage.ps1 dev
   ```

2. **Importe no Postman**:
   - Arraste os arquivos JSON para o Postman
   - Selecione o ambiente "Caixa Eletrônico - Ambiente Local"

### 2. Execução Automática Completa

#### Opção A - Collection Runner (Recomendado)

1. Clique com botão direito na coleção "Caixa Eletrônico API"
2. Escolha **"Run collection"**
3. Clique em **"Run Caixa Eletrônico API"**
4. Aguarde a execução completa (≈ 30 segundos)

#### Opção B - Linha de Comando (Newman)

```bash
# Instalar Newman
npm install -g newman

# Executar testes
newman run CaixaEletronico_Postman_Collection.json -e CaixaEletronico_Environment.json
```

### 3. O Que Acontece Durante a Execução

```
🔐 AUTENTICAÇÃO
├── ✅ Registra usuário dinâmico (usuario1672891234)
├── ✅ Registra admin dinâmico (admin1672891234)
├── ✅ Login usuário → Token salvo
├── ✅ Login admin → Token admin salvo
├── ✅ Obtém dados do usuário
└── ✅ Lista contas → IDs salvos

💰 OPERAÇÕES BANCÁRIAS
├── ✅ Depósito R$ 500,00 → Saldo atualizado
└── ✅ Transferência R$ 100,00 → Entre contas

🏧 OPERAÇÕES DE SAQUE
├── ✅ Obtém opções de saque R$ 200,00
└── ✅ Confirma saque → Opção salva automaticamente

📅 PAGAMENTOS
├── ✅ Agenda pagamento R$ 150,00 → ID salvo
├── ✅ Consulta pagamento → Usando ID salvo
├── ✅ Lista pagamentos da conta
└── ✅ Cancela pagamento → Usando ID salvo

📊 EXTRATOS
├── ✅ Obtém extrato → Operação ID salva
└── ✅ Obtém extrato por período

📦 ESTOQUE
└── ✅ Consulta estoque global

👨‍💼 OPERAÇÕES ADMINISTRATIVAS
├── ✅ Lista operações do usuário (admin)
└── ✅ Desfaz operação (admin)
```

### 4. Resultados Esperados

**✅ Testes Passando**: 28/28 testes
**⏱️ Tempo Total**: ~30 segundos
**🔄 Execuções**: 17 requests

### 5. Troubleshooting

#### Problema: Teste falha
- **Solução**: Verifique se a aplicação está rodando
- **Verificação**: Acesse `http://localhost:8080` no navegador

#### Problema: Token inválido
- **Solução**: Execute novamente - tokens são regenerados automaticamente

#### Problema: Conta não encontrada
- **Solução**: Execute a partir do "Registrar Usuário"

#### Problema: Operação não encontrada para desfazer
- **Solução**: Execute as operações bancárias primeiro

### 6. Logs Detalhados

Durante a execução, você verá logs como:
```
🚀 Gerando usuário dinâmico: usuario1672891234
✅ Token salvo automaticamente: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Conta ID salvo automaticamente: 1
✅ Depósito realizado com sucesso
✅ Saque confirmado com sucesso
✅ Pagamento agendado com sucesso
✅ Operação desfeita com sucesso pelo admin
```

### 7. Dados Gerados Automaticamente

A execução cria automaticamente:
- **Usuário**: `usuario[timestamp]`
- **Admin**: `admin[timestamp]`
- **Depósito**: R$ 500,00
- **Transferência**: R$ 100,00
- **Saque**: R$ 200,00
- **Pagamento**: R$ 150,00 (3x de R$ 50,00)

### 8. Próximos Passos

Após a execução completa, você pode:
1. **Verificar dados**: Use endpoints individuais
2. **Executar novamente**: Gera novos usuários automaticamente
3. **Personalizar valores**: Edite os requests conforme necessário
4. **Integrar CI/CD**: Use Newman para automação

---

## 🎯 Resumo

Este sistema permite testar **completamente** a API do Caixa Eletrônico em **uma única execução**, validando todos os cenários principais com dados dinâmicos e testes automatizados.

**Basta clicar em "Run collection" e aguardar! 🚀**
