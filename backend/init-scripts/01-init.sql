-- Script de inicialização do banco de dados
-- Este script será executado automaticamente quando o container PostgreSQL for iniciado

-- Configurações do banco
ALTER DATABASE caixaeletronico SET timezone = 'America/Sao_Paulo';

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados caixaeletronico inicializado com sucesso!';
END
$$;
