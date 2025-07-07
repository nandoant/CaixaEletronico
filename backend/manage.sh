#!/bin/bash

# Script para gerenciar o ambiente Docker do Caixa Eletrônico

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se o Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker não está rodando. Por favor, inicie o Docker."
        exit 1
    fi
}

# Função para construir e executar os serviços
start() {
    log_info "Iniciando serviços do Caixa Eletrônico..."
    check_docker
    docker-compose up -d --build
    log_info "Serviços iniciados com sucesso!"
    log_info "API disponível em: http://localhost:8080"
    log_info "Swagger UI em: http://localhost:8080/swagger-ui.html"
    log_info "Health Check em: http://localhost:8080/actuator/health"
}

# Função para parar os serviços
stop() {
    log_info "Parando serviços do Caixa Eletrônico..."
    docker-compose down
    log_info "Serviços parados com sucesso!"
}

# Função para reiniciar os serviços
restart() {
    log_info "Reiniciando serviços do Caixa Eletrônico..."
    stop
    start
}

# Função para limpar dados (volumes)
clean() {
    log_warn "Esta operação irá remover todos os dados do banco de dados!"
    read -p "Você tem certeza? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Limpando dados..."
        docker-compose down -v
        log_info "Dados removidos com sucesso!"
    else
        log_info "Operação cancelada."
    fi
}

# Função para visualizar logs
logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        log_info "Visualizando logs de todos os serviços..."
        docker-compose logs -f
    else
        log_info "Visualizando logs do serviço: $service"
        docker-compose logs -f "$service"
    fi
}

# Função para verificar status dos serviços
status() {
    log_info "Status dos serviços:"
    docker-compose ps
}

# Função para acessar o container do backend
shell() {
    log_info "Acessando container do backend..."
    docker-compose exec backend bash
}

# Função para acessar o PostgreSQL
psql() {
    log_info "Acessando PostgreSQL..."
    docker-compose exec postgres psql -U caixaeletronico -d caixaeletronico
}

# Função para executar apenas o banco de dados
dev() {
    log_info "Iniciando apenas o banco de dados para desenvolvimento..."
    check_docker
    docker-compose up -d postgres
    log_info "PostgreSQL iniciado! Conecte em: localhost:5432"
    log_info "Banco: caixaeletronico | Usuário: caixaeletronico | Senha: caixaeletronico123"
}

# Função para executar testes
test() {
    log_info "Executando testes..."
    docker-compose exec backend mvn test
}

# Função para exibir ajuda
help() {
    echo "Uso: $0 {start|stop|restart|clean|logs|status|shell|psql|dev|test|help}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start   - Inicia todos os serviços"
    echo "  stop    - Para todos os serviços"
    echo "  restart - Reinicia todos os serviços"
    echo "  clean   - Remove todos os dados (volumes)"
    echo "  logs    - Visualiza logs (opcional: especificar serviço)"
    echo "  status  - Mostra status dos serviços"
    echo "  shell   - Acessa o shell do container backend"
    echo "  psql    - Acessa o PostgreSQL"
    echo "  dev     - Inicia apenas o banco para desenvolvimento"
    echo "  test    - Executa testes"
    echo "  help    - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 start"
    echo "  $0 logs backend"
    echo "  $0 logs postgres"
}

# Processar argumentos
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    clean)
        clean
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    shell)
        shell
        ;;
    psql)
        psql
        ;;
    dev)
        dev
        ;;
    test)
        test
        ;;
    help)
        help
        ;;
    *)
        log_error "Comando inválido: $1"
        help
        exit 1
        ;;
esac
