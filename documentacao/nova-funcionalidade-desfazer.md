# Nova Funcionalidade: Desfazer Operação Específica

## Resumo

A funcionalidade de desfazer operações foi aprimorada para permitir que administradores possam desfazer qualquer operação específica através do ID da operação e ID do usuário, ao invés de apenas a última operação do sistema.

## Principais Alterações

### 1. Modelo `Operacao`
- Adicionado campo `desfeita` (Boolean) para controlar se a operação foi desfeita
- Adicionado campo `adminResponsavelDesfazer` (String) para registrar qual admin desfez a operação
- Adicionado campo `dataHoraDesfazer` (LocalDateTime) para registrar quando a operação foi desfeita

### 2. Repositório `OperacaoRepository`
- Adicionado método `findByUsuarioResponsavelOrderByDataHoraDesc()` para buscar operações por usuário
- Adicionado método `findByUsuarioResponsavelAndNaoDesfeita()` para buscar operações não desfeitas de um usuário
- Adicionado método `findByIdAndUsuarioResponsavelAndNaoDesfeita()` para buscar operação específica não desfeita

### 3. Serviço `CommandManagerService`
- Removido sistema de pilha (Stack) para controle de undo
- Adicionado método `desfazerOperacaoEspecifica(Long operacaoId, Long usuarioId, Usuario admin)`
- Adicionado método `listarOperacoesUsuario(Long usuarioId, Usuario admin)`
- Implementadas validações de segurança para garantir que apenas admins possam desfazer operações

### 4. Controller `UndoController`
- Substituído endpoint `POST /operacoes/desfazer` por `POST /operacoes/desfazer/{operacaoId}/usuario/{usuarioId}`
- Adicionado endpoint `GET /operacoes/desfazer/usuario/{usuarioId}/operacoes` para listar operações de um usuário
- Atualizada documentação da API

## Novos Endpoints

### Desfazer Operação Específica
```
POST /operacoes/desfazer/{operacaoId}/usuario/{usuarioId}
```
- **Descrição**: Desfaz uma operação específica
- **Parâmetros**: 
  - `operacaoId`: ID da operação a ser desfeita
  - `usuarioId`: ID do usuário proprietário da operação
- **Autorização**: Apenas ADMIN
- **Resposta de Sucesso**:
```json
{
    "message": "Operação 123 do usuário 456 desfeita com sucesso",
    "operacaoId": 123,
    "usuarioId": 456,
    "adminResponsavel": "admin"
}
```

### Listar Operações de um Usuário
```
GET /operacoes/desfazer/usuario/{usuarioId}/operacoes
```
- **Descrição**: Lista todas as operações de um usuário específico
- **Parâmetros**: 
  - `usuarioId`: ID do usuário
- **Autorização**: Apenas ADMIN
- **Resposta de Sucesso**:
```json
{
    "usuarioId": 456,
    "operacoes": [
        {
            "id": 123,
            "tipo": "DEPOSITO",
            "valor": 1000.00,
            "dataHora": "2024-01-15T10:30:00",
            "desfeita": false,
            "adminResponsavelDesfazer": null,
            "dataHoraDesfazer": null
        }
    ],
    "total": 1
}
```

## Validações de Segurança

1. **Autorização**: Apenas usuários com perfil ADMIN podem acessar os endpoints
2. **Verificação de Usuário**: Valida se o usuário alvo existe
3. **Verificação de Operação**: Valida se a operação existe e pertence ao usuário especificado
4. **Controle de Estado**: Não permite desfazer operações já desfeitas
5. **Memento**: Verifica se a operação tem memento disponível para ser desfeita

## Melhorias Implementadas

1. **Controle de Auditoria**: Registra qual admin desfez a operação e quando
2. **Flexibilidade**: Permite desfazer qualquer operação específica, não apenas a última
3. **Segurança**: Validações robustas para evitar operações inválidas
4. **Rastreabilidade**: Histórico completo de operações desfeitas
5. **API Documentada**: Documentação completa com Swagger

## Impacto no Sistema

- **Remoção**: Sistema de pilha (Stack) para controle de undo foi removido
- **Adição**: Novos campos na tabela `operacoes` para controle de estado
- **Melhoria**: Maior flexibilidade e controle para administradores
- **Segurança**: Validações mais rigorosas para operações administrativas

## Próximos Passos Recomendados

1. Executar migração de banco de dados para adicionar os novos campos
2. Testar a funcionalidade com diferentes cenários
3. Considerar implementar logs mais detalhados para auditoria
4. Avaliar a possibilidade de implementar "aprovação dupla" para operações críticas
