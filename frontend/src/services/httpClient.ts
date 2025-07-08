// HTTP Client with interceptors
export class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:8080') {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🌐 GET Request para:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();

    console.log('🌐 POST Request para:', url);
    console.log('📋 Request data:', JSON.stringify(data, null, 2));
    console.log('🔐 Headers completos:', JSON.stringify(headers, null, 2));

    // Log específico do token para debug de 403
    if (headers.Authorization) {
      const token = headers.Authorization.replace('Bearer ', '');
      console.log('🔍 [HTTP] Token sendo enviado (primeiros 50 chars):', token.substring(0, 50) + '...');
      console.log('🔍 [HTTP] Token length:', token.length);

      // Verificar se é JWT válido
      const tokenParts = token.split('.');
      console.log('🔍 [HTTP] Token parts count:', tokenParts.length);
      if (tokenParts.length === 3) {
        console.log('✅ [HTTP] Token é JWT válido');
      } else {
        console.warn('⚠️ [HTTP] Token NÃO é JWT válido!');
      }
    } else {
      console.error('🚫 [HTTP] NENHUM Authorization header encontrado!');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      return this.handleResponse<T>(response);
    } catch (networkError: any) {
      console.error('🚨 Network error:', networkError);
      throw new Error(`Erro de rede: ${networkError.message || 'Falha na conectividade'}`);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('📡 Status da resposta:', response.status, response.statusText);
    console.log('📡 Response URL:', response.url);
    console.log('📡 Response type:', response.type);
    console.log('📡 Response redirected:', response.redirected);

    if (response.status === 401) {
      console.error('🚫 Token expirado ou inválido - redirecionando para login');
      // Token expirado ou inválido - fazer logout
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      let errorDetails = '';

      // Clone a response para poder tentar multiple reads
      const responseClone = response.clone();

      try {
        const errorText = await response.text();
        console.log('🚨 Erro response body (texto bruto):', errorText);

        if (errorText) {
          errorDetails = errorText;

          // Tentar parsear como JSON
          try {
            const errorData = JSON.parse(errorText);
            console.log('🚨 Dados do erro (JSON parseado):', errorData);

            // Extrair mensagem de erro
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.details) {
              errorMessage = errorData.details;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }

            errorDetails = JSON.stringify(errorData, null, 2);

            // Log específico para erro 403
            if (response.status === 403) {
              console.log('🔍 [403] Analisando erro de autorização...');
              console.log('🔍 [403] Mensagem do backend:', errorData.message || 'não especificada');
              console.log('🔍 [403] Detalhes do backend:', errorData.details || errorData.error || 'não especificados');
              console.log('🔍 [403] Timestamp do erro:', errorData.timestamp || 'não especificado');
              console.log('🔍 [403] Path do erro:', errorData.path || 'não especificado');

              if (errorData.message) {
                if (errorData.message.includes('conta') || errorData.message.includes('Conta')) {
                  console.log('💡 [403] Erro relacionado à conta detectado!');
                }
                if (errorData.message.includes('token') || errorData.message.includes('Token')) {
                  console.log('💡 [403] Erro relacionado ao token detectado!');
                }
                if (errorData.message.includes('permiss') || errorData.message.includes('Permiss')) {
                  console.log('💡 [403] Erro relacionado a permissões detectado!');
                }
              }
            }

          } catch (jsonParseError) {
            console.log('⚠️ Resposta não é JSON válido, usando texto bruto');
            errorMessage = errorText || errorMessage;

            // Para erro 403, tentar extrair informações úteis do texto
            if (response.status === 403 && errorText) {
              console.log('🔍 [403] Analisando texto do erro...');
              if (errorText.toLowerCase().includes('forbidden')) {
                console.log('💡 [403] Confirmado: resposta contém "forbidden"');
                errorMessage = 'Acesso negado - ' + errorText;
              }
            }
          }
        } else {
          errorDetails = `Status: ${response.status} ${response.statusText}`;
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }

      } catch (readError) {
        console.log('🚨 Erro ao ler response body:', readError);
        errorDetails = `Status: ${response.status} ${response.statusText}`;
        errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
      }

      console.error(`🚨 Erro HTTP ${response.status}:`, errorMessage);
      console.error('🚨 Detalhes do erro:', errorDetails);

      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }

    try {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      return data;
    } catch (parseError) {
      console.error('🚨 Erro ao parsear resposta JSON:', parseError);
      throw new Error('Resposta inválida do servidor - não é JSON válido');
    }
  }
}

// Instância global do cliente HTTP
export const httpClient = new HttpClient();
