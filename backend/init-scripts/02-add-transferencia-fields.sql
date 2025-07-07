-- Script de migração para adicionar campos de transferência
-- Executa automaticamente quando o Spring Boot detectar mudanças na entidade

-- Adicionar coluna conta_destino_id à tabela pagamentos_agendados
ALTER TABLE pagamentos_agendados 
ADD COLUMN IF NOT EXISTS conta_destino_id BIGINT;

-- Adicionar coluna descricao à tabela pagamentos_agendados
ALTER TABLE pagamentos_agendados 
ADD COLUMN IF NOT EXISTS descricao VARCHAR(255);

-- Adicionar foreign key para conta_destino_id
ALTER TABLE pagamentos_agendados 
ADD CONSTRAINT IF NOT EXISTS fk_pagamentos_agendados_conta_destino 
FOREIGN KEY (conta_destino_id) REFERENCES contas(id);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendados_conta_destino ON pagamentos_agendados(conta_destino_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendados_data_proxima_execucao ON pagamentos_agendados(data_proxima_execucao);
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendados_status ON pagamentos_agendados(status);

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Migração de transferências agendadas aplicada com sucesso!';
END
$$;
