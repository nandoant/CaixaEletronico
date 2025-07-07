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
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
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
    
    if (response.status === 401) {
      // Token expirado ou inválido - fazer logout
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      try {
        const errorData = await response.json();
        console.log('🚨 Dados do erro:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        console.log('🚨 Não foi possível parsear erro como JSON');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    return data;
  }
}

// Instância global do cliente HTTP
export const httpClient = new HttpClient();
