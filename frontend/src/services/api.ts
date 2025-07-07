import axios from 'axios';
import type {
  LoginForm,
  RegisterForm,
  AuthResponse,
  ApiResponse
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

console.log('API Base URL configurada:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token e debug
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Debug: log da requisição
  console.log('API Request:', {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL}${config.url}`,
    data: config.data,
    headers: config.headers
  });

  return config;
});

// Interceptor para lidar com erros de autenticação e debug
api.interceptors.response.use(
  (response) => {
    // Debug: log da resposta
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Debug: log do erro
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterForm): Promise<ApiResponse<any>> {
    const { confirmaSenha, ...dataToSend } = userData;
    const response = await api.post<ApiResponse<any>>('/auth/register', dataToSend);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default api;
