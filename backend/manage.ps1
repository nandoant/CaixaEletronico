# Script PowerShell para gerenciar o ambiente Docker do Caixa Eletrônico

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1)]
    [string]$Service = ""
)

# Cores para output
$Green = "`e[32m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Reset = "`e[0m"

# Função para exibir mensagens
function Log-Info {
    param([string]$Message)
    Write-Host "${Green}[INFO]${Reset} $Message"
}

function Log-Warn {
    param([string]$Message)
    Write-Host "${Yellow}[WARN]${Reset} $Message"
}

function Log-Error {
    param([string]$Message)
    Write-Host "${Red}[ERROR]${Reset} $Message"
}

# Função para verificar se o Docker está rodando
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Log-Error "Docker não está rodando. Por favor, inicie o Docker."
        exit 1
    }
}

# Função para construir e executar os serviços
function Start-Services {
    Log-Info "Iniciando serviços do Caixa Eletrônico..."
    Test-Docker
    docker-compose up -d --build
    Log-Info "Serviços iniciados com sucesso!"
    Log-Info "API disponível em: http://localhost:8080"
    Log-Info "Swagger UI em: http://localhost:8080/swagger-ui.html"
    Log-Info "Health Check em: http://localhost:8080/actuator/health"
}

# Função para parar os serviços
function Stop-Services {
    Log-Info "Parando serviços do Caixa Eletrônico..."
    docker-compose down
    Log-Info "Serviços parados com sucesso!"
}

# Função para reiniciar os serviços
function Restart-Services {
    Log-Info "Reiniciando serviços do Caixa Eletrônico..."
    Stop-Services
    Start-Services
}

# Função para limpar dados (volumes)
function Clean-Data {
    Log-Warn "Esta operação irá remover todos os dados do banco de dados!"
    $confirmation = Read-Host "Você tem certeza? [y/N]"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Log-Info "Limpando dados..."
        docker-compose down -v
        Log-Info "Dados removidos com sucesso!"
    } else {
        Log-Info "Operação cancelada."
    }
}

# Função para visualizar logs
function Show-Logs {
    param([string]$ServiceName = "")
    if ([string]::IsNullOrEmpty($ServiceName)) {
        Log-Info "Visualizando logs de todos os serviços..."
        docker-compose logs -f
    } else {
        Log-Info "Visualizando logs do serviço: $ServiceName"
        docker-compose logs -f $ServiceName
    }
}

# Função para verificar status dos serviços
function Show-Status {
    Log-Info "Status dos serviços:"
    docker-compose ps
}

# Função para acessar o container do backend
function Enter-Shell {
    Log-Info "Acessando container do backend..."
    docker-compose exec backend bash
}

# Função para acessar o PostgreSQL
function Enter-PostgreSQL {
    Log-Info "Acessando PostgreSQL..."
    docker-compose exec postgres psql -U caixaeletronico -d caixaeletronico
}

# Função para executar apenas o banco de dados
function Start-Dev {
    Log-Info "Iniciando apenas o banco de dados para desenvolvimento..."
    Test-Docker
    docker-compose up -d postgres
    Log-Info "PostgreSQL iniciado! Conecte em: localhost:5432"
    Log-Info "Banco: caixaeletronico | Usuário: caixaeletronico | Senha: caixaeletronico123"
}

# Função para executar testes
function Run-Tests {
    Log-Info "Executando testes..."
    docker-compose exec backend mvn test
}

# Função para exibir ajuda
function Show-Help {
    Write-Host "Uso: .\manage.ps1 {start|stop|restart|clean|logs|status|shell|psql|dev|test|help}"
    Write-Host ""
    Write-Host "Comandos disponíveis:"
    Write-Host "  start   - Inicia todos os serviços"
    Write-Host "  stop    - Para todos os serviços"
    Write-Host "  restart - Reinicia todos os serviços"
    Write-Host "  clean   - Remove todos os dados (volumes)"
    Write-Host "  logs    - Visualiza logs (opcional: especificar serviço)"
    Write-Host "  status  - Mostra status dos serviços"
    Write-Host "  shell   - Acessa o shell do container backend"
    Write-Host "  psql    - Acessa o PostgreSQL"
    Write-Host "  dev     - Inicia apenas o banco para desenvolvimento"
    Write-Host "  test    - Executa testes"
    Write-Host "  help    - Mostra esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:"
    Write-Host "  .\manage.ps1 start"
    Write-Host "  .\manage.ps1 logs backend"
    Write-Host "  .\manage.ps1 logs postgres"
}

# Processar comandos
switch ($Command.ToLower()) {
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "clean" { Clean-Data }
    "logs" { Show-Logs -ServiceName $Service }
    "status" { Show-Status }
    "shell" { Enter-Shell }
    "psql" { Enter-PostgreSQL }
    "dev" { Start-Dev }
    "test" { Run-Tests }
    "help" { Show-Help }
    default {
        Log-Error "Comando inválido: $Command"
        Show-Help
        exit 1
    }
}
