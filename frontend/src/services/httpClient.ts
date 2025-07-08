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

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (networkError: any) {
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

        if (errorText) {
          errorDetails = errorText;

          try {
            const errorData = JSON.parse(errorText);

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

          } catch (jsonParseError) {
            errorMessage = errorText || errorMessage;

            if (response.status === 403 && errorText) {
              if (errorText.toLowerCase().includes('forbidden')) {
                errorMessage = 'Acesso negado - ' + errorText;
              }
            }
          }
        } else {
          errorDetails = `Status: ${response.status} ${response.statusText}`;
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }

      } catch (readError) {
        errorDetails = `Status: ${response.status} ${response.statusText}`;
        errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }

    try {
      const data = await response.json();
      return data;
    } catch (parseError) {
      throw new Error('Resposta inválida do servidor - não é JSON válido');
    }
  }
}

// Instância global do cliente HTTP
export const httpClient = new HttpClient();
