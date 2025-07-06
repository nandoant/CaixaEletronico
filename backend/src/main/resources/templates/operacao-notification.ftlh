<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificação de Operação</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .content {
            color: #34495e;
            line-height: 1.6;
        }
        .operation-details {
            background-color: #ecf0f1;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .operation-details h3 {
            color: #2c3e50;
            margin-top: 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #bdc3c7;
        }
        .detail-label {
            font-weight: bold;
            color: #2c3e50;
        }
        .detail-value {
            color: #27ae60;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #bdc3c7;
            color: #7f8c8d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 Caixa Eletrônico</h1>
            <h2>Notificação de Operação</h2>
        </div>
        
        <div class="content">
            <p>Olá,</p>
            <p>Uma nova operação foi realizada em sua conta. Confira os detalhes abaixo:</p>
            
            <div class="operation-details">
                <h3>Detalhes da Operação</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">${tipoOperacao}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Valor:</span>
                    <span class="detail-value">${valor}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Data e Hora:</span>
                    <span class="detail-value">${dataHora}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Usuário Responsável:</span>
                    <span class="detail-value">${operacao.usuarioResponsavel}</span>
                </div>
                
                <#if operacao.contaOrigem??>
                <div class="detail-row">
                    <span class="detail-label">Conta Origem:</span>
                    <span class="detail-value">${operacao.contaOrigem.titular}</span>
                </div>
                </#if>
                
                <#if operacao.contaDestino??>
                <div class="detail-row">
                    <span class="detail-label">Conta Destino:</span>
                    <span class="detail-value">${operacao.contaDestino.titular}</span>
                </div>
                </#if>
            </div>
            
            <p><strong>Importante:</strong> Se você não reconhece esta operação, entre em contato conosco imediatamente.</p>
        </div>
        
        <div class="footer">
            <p>Esta é uma mensagem automática, não responda este email.</p>
            <p>© 2025 Caixa Eletrônico - Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
