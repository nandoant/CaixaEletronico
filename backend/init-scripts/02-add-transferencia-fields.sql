-- Script de migração para adicionar campos de transferência
-- Executa automaticamente quando o Spring Boot detectar mudanças na entidade

-- Função para verificar se a tabela existe antes de fazer alterações
DO $$
BEGIN
    -- Verificar se a tabela pagamentos_agendados existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pagamentos_agendados') THEN
        
        -- Adicionar coluna conta_destino_id à tabela pagamentos_agendados
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'pagamentos_agendados' AND column_name = 'conta_destino_id') THEN
            ALTER TABLE pagamentos_agendados ADD COLUMN conta_destino_id BIGINT;
        END IF;

        -- Adicionar coluna descricao à tabela pagamentos_agendados
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'pagamentos_agendados' AND column_name = 'descricao') THEN
            ALTER TABLE pagamentos_agendados ADD COLUMN descricao VARCHAR(255);
        END IF;

        -- Adicionar foreign key para conta_destino_id se não existir
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'fk_pagamentos_agendados_conta_destino') THEN
            ALTER TABLE pagamentos_agendados 
            ADD CONSTRAINT fk_pagamentos_agendados_conta_destino 
            FOREIGN KEY (conta_destino_id) REFERENCES contas(id);
        END IF;

        -- Criar índices para melhorar performance
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_pagamentos_agendados_conta_destino') THEN
            CREATE INDEX idx_pagamentos_agendados_conta_destino ON pagamentos_agendados(conta_destino_id);
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_pagamentos_agendados_data_proxima_execucao') THEN
            CREATE INDEX idx_pagamentos_agendados_data_proxima_execucao ON pagamentos_agendados(data_proxima_execucao);
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_pagamentos_agendados_status') THEN
            CREATE INDEX idx_pagamentos_agendados_status ON pagamentos_agendados(status);
        END IF;

        RAISE NOTICE 'Migração de transferências agendadas aplicada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela pagamentos_agendados não encontrada. Migração será aplicada quando a tabela for criada pelo Spring Boot.';
    END IF;
END
$$;

