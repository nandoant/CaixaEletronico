#!/bin/bash

echo "🚀 Iniciando Caixa Eletrônico Frontend..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se é desenvolvimento ou produção
if [ "$1" = "dev" ]; then
    echo "🔧 Modo Desenvolvimento (com hot reload)"
    docker-compose -f docker-compose.dev.yml up --build frontend
elif [ "$1" = "prod" ]; then
    echo "🏭 Modo Produção"
    docker-compose up --build frontend
elif [ "$1" = "full" ]; then
    echo "🌐 Executando aplicação completa (Backend + Frontend + Banco)"
    docker-compose -f docker-compose.dev.yml up --build
else
    echo "📋 Uso: ./start.sh [dev|prod|full]"
    echo "  dev  - Frontend em desenvolvimento (hot reload)"
    echo "  prod - Frontend em produção"
    echo "  full - Aplicação completa"
    exit 1
fi
