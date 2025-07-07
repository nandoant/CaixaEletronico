@echo off
echo 🚀 Iniciando Caixa Eletrônico Frontend...

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker primeiro.
    exit /b 1
)

REM Verificar se é desenvolvimento ou produção
if "%1"=="dev" (
    echo 🔧 Modo Desenvolvimento ^(com hot reload^)
    docker-compose -f docker-compose.dev.yml up --build frontend
) else if "%1"=="prod" (
    echo 🏭 Modo Produção
    docker-compose up --build frontend
) else if "%1"=="full" (
    echo 🌐 Executando aplicação completa ^(Backend + Frontend + Banco^)
    docker-compose -f docker-compose.dev.yml up --build
) else (
    echo 📋 Uso: start.bat [dev^|prod^|full]
    echo   dev  - Frontend em desenvolvimento ^(hot reload^)
    echo   prod - Frontend em produção
    echo   full - Aplicação completa
    exit /b 1
)
