import { httpClient } from './httpClient';

// API Types
export interface LoginRequest {
  login: string;
  senha: string;
}

export interface RegisterRequest {
  login: string;
  email: string;
  senha: string;
  perfil: 'CLIENTE' | 'ADMIN';
}

export interface Usuario {
  userId: number;
  perfil: string;
  email: string;
  login: string;
}

export interface Conta {
  contaId: number;
  numeroConta: string;
  titular: string;
  usuarioProprietario: string;
  usuarioProprietarioId: number;
}

export interface Autenticacao {
  type: string;
  token: string;
  expiresIn: string;
}

export interface LoginResponse {
  dados: {
    conta: Conta;
    usuario: Usuario;
    autenticacao: Autenticacao;
  };
  message: string;
  timestamp: string;
}

export interface RegisterResponse {
  dados: {
    proximosPassos: string[];
    usuario: Usuario;
  };
  message: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  timestamp: string;
  details?: string;
}

export interface MeResponse {
  dados: {
    usuario: Usuario;
    conta?: Conta;
    sessao: {
      ultimaAtividade: string;
    };
  };
  message: string;
  timestamp: string;
}

// Auth Service
class AuthService {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      return await httpClient.post<LoginResponse>('/auth/login', loginData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }

  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    try {
      return await httpClient.post<RegisterResponse>('/auth/register', registerData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }

  async me(): Promise<MeResponse> {
    try {
      return await httpClient.get<MeResponse>('/auth/me');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar dados do usuário');
    }
  }

  // Métodos utilitários para token
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  // Método para verificar se o token ainda é válido
  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
