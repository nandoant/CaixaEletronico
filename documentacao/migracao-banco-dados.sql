-- Migração para adicionar campos de controle de operações desfeitas
-- Execute este script no seu banco de dados para adicionar os novos campos

-- Adicionar campo desfeita (controla se a operação foi desfeita)
ALTER TABLE operacoes ADD COLUMN desfeita BOOLEAN DEFAULT FALSE;

-- Adicionar campo admin_responsavel_desfazer (registra qual admin desfez)
ALTER TABLE operacoes ADD COLUMN admin_responsavel_desfazer VARCHAR(100);

-- Adicionar campo data_hora_desfazer (registra quando foi desfeita)
ALTER TABLE operacoes ADD COLUMN data_hora_desfazer TIMESTAMP;

-- Atualizar registros existentes para marcar como não desfeitas
UPDATE operacoes SET desfeita = FALSE WHERE desfeita IS NULL;

-- Criar índices para melhorar performance das consultas
CREATE INDEX idx_operacoes_usuario_desfeita ON operacoes(usuario_responsavel, desfeita);
CREATE INDEX idx_operacoes_desfeita ON operacoes(desfeita);
CREATE INDEX idx_operacoes_admin_desfazer ON operacoes(admin_responsavel_desfazer);

-- Comentários para documentação
COMMENT ON COLUMN operacoes.desfeita IS 'Indica se a operação foi desfeita por um administrador';
COMMENT ON COLUMN operacoes.admin_responsavel_desfazer IS 'Login do administrador que desfez a operação';
COMMENT ON COLUMN operacoes.data_hora_desfazer IS 'Data e hora em que a operação foi desfeita';
