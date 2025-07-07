# Agendamento de Transferências entre Contas

## Resumo das Mudanças

O sistema de agendamento de pagamentos foi atualizado para permitir **transferências agendadas entre contas**, mantendo a funcionalidade de parcelamento e todas as características do sistema original.

## Principais Alterações

### 1. Modelo de Dados (`PagamentoAgendado`)
- **Novo campo**: `contaDestino` - Referência para a conta que receberá a transferência
- **Novo campo**: `descricao` - Descrição opcional da transferência
- **Construtor atualizado**: Inclui conta destino e descrição

### 2. API REST (`PagamentoController`)
- **Novo endpoint**: `POST /pagamentos/agendar` com estrutura para transferências
- **Novo DTO**: `TransferenciaAgendadaRequest`
- **Conta origem**: Obtida automaticamente do usuário logado
- **Conta destino**: Informada pelo usuário no request

### 3. Service Layer (`PaymentScheduleService`)
- **Novo método**: `criarTransferenciaAgendada()`
- **Validações**: Verifica se contas origem e destino são diferentes
- **Execução**: Transfere valores entre contas quando `debitarPrimeiraParcela = true`

### 4. Banco de Dados
- **Script de migração**: `02-add-transferencia-fields.sql`
- **Novas colunas**: `conta_destino_id`, `descricao`
- **Índices**: Para melhorar performance das consultas

## Estrutura da Requisição

### JSON Request
```json
{
  "contaDestinoId": 2,
  "valorTotal": 150.00,
  "quantidadeParcelas": 3,
  "periodicidadeDias": 30,
  "dataInicio": "2025-07-15",
  "debitarPrimeiraParcela": true,
  "descricao": "Transferência agendada para conta poupança"
}
```

### Campos Obrigatórios
- `contaDestinoId`: ID da conta destino
- `valorTotal`: Valor total a ser transferido
- `quantidadeParcelas`: Número de parcelas
- `periodicidadeDias`: Intervalo entre parcelas
- `dataInicio`: Data da primeira parcela

### Campos Opcionais
- `debitarPrimeiraParcela`: Executa primeira parcela imediatamente (default: false)
- `descricao`: Descrição da transferência

## Funcionalidades Mantidas

### ✅ Parcelamento
- Transferências podem ser divididas em múltiplas parcelas
- Periodicidade configurável (dias, semanas, meses)
- Controle de parcelas restantes

### ✅ Débito Imediato
- Primeira parcela pode ser executada imediatamente
- Validação de saldo antes da execução
- Atualização automática de saldos

### ✅ Agendamento
- Todas as parcelas podem ser agendadas
- Execução automática nas datas programadas
- Controle de status (ATIVO, CONCLUIDO, CANCELADO)

### ✅ Gerenciamento
- Consulta de transferências por ID
- Cancelamento de transferências
- Listagem de transferências por conta

## Casos de Uso

### 1. Transferência Única
```json
{
  "contaDestinoId": 5,
  "valorTotal": 100.00,
  "quantidadeParcelas": 1,
  "periodicidadeDias": 1,
  "dataInicio": "2025-07-07",
  "debitarPrimeiraParcela": true,
  "descricao": "Pagamento único"
}
```

### 2. Aluguel Mensal
```json
{
  "contaDestinoId": 8,
  "valorTotal": 1200.00,
  "quantidadeParcelas": 12,
  "periodicidadeDias": 30,
  "dataInicio": "2025-08-01",
  "debitarPrimeiraParcela": false,
  "descricao": "Aluguel mensal - 12 meses"
}
```

### 3. Financiamento
```json
{
  "contaDestinoId": 3,
  "valorTotal": 600.00,
  "quantidadeParcelas": 6,
  "periodicidadeDias": 30,
  "dataInicio": "2025-07-15",
  "debitarPrimeiraParcela": true,
  "descricao": "Financiamento pessoal"
}
```

## Resposta da API

```json
{
  "message": "Transferência agendada com sucesso",
  "id": 123,
  "contaOrigemId": 1,
  "contaDestinoId": 5,
  "valorTotal": 600.00,
  "valorParcela": 100.00,
  "quantidadeParcelas": 6,
  "parcelasRestantes": 5,
  "periodicidadeDias": 30,
  "dataProximaExecucao": "2025-08-15",
  "status": "ATIVO",
  "primeiraParcelaDebitada": true,
  "valorDebitadoAgora": 100.00,
  "novoSaldo": 1900.00,
  "descricao": "Financiamento pessoal"
}
```

## Validações

### Servidor
- Conta destino deve existir
- Conta origem ≠ conta destino
- Valor total > 0
- Quantidade de parcelas > 0
- Periodicidade > 0
- Saldo suficiente (quando `debitarPrimeiraParcela = true`)

### Cliente (Recomendado)
- Validação em tempo real da conta destino
- Validação de valores mínimos
- Verificação de datas futuras
- Limite de caracteres na descrição (255)

## Compatibilidade

O sistema **mantém compatibilidade** com a API anterior através do método `agendarPagamento()` que internamente converte para o novo formato de transferência.

## Testes

A coleção do Postman foi atualizada com:
- Exemplo de transferência agendada
- Validações de resposta atualizadas
- Variáveis de ambiente para testes
- Casos de teste para diferentes cenários

## Próximos Passos

1. **Executar migração**: Aplicar script SQL para adicionar novas colunas
2. **Testar API**: Usar coleção do Postman atualizada
3. **Atualizar Frontend**: Modificar formulários para usar nova estrutura
4. **Documentar**: Atualizar documentação da API
5. **Monitorar**: Acompanhar logs de execução das transferências

---

**Autor**: Sistema de Caixa Eletrônico  
**Data**: 07/07/2025  
**Versão**: 1.1.0
