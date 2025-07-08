import React, { createContext, useContext, useState, useEffect } from "react";
import {
  authService,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  MeResponse,
} from "../services/authService";

interface User {
  id: number;
  login: string;
  email: string;
  perfil: "CLIENTE" | "ADMIN";
  contaId: number;
  numeroConta: string;
  titular: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (loginData: LoginRequest) => Promise<LoginResponse>;
  register: (registerData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = authService.getToken();
      if (savedToken && authService.isTokenValid(savedToken)) {
        setToken(savedToken);
        try {
          const response = await authService.me();

          const userData: User = {
            id: response.dados.usuario.userId,
            login: response.dados.usuario.login,
            email: response.dados.usuario.email,
            perfil: response.dados.usuario.perfil as "CLIENTE" | "ADMIN",
            contaId: response.dados.conta?.contaId || 0,
            numeroConta: response.dados.conta?.numeroConta || "",
            titular: response.dados.conta?.titular || "",
          };

          setUser(userData);
        } catch (error) {
          authService.removeToken();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(loginData);

      // Mapear dados da resposta para o formato do contexto
      const userData: User = {
        id: response.dados.usuario.userId,
        login: response.dados.usuario.login,
        email: response.dados.usuario.email,
        perfil: response.dados.usuario.perfil as "CLIENTE" | "ADMIN",
        contaId: response.dados.conta.contaId,
        numeroConta: response.dados.conta.numeroConta,
        titular: response.dados.conta.titular,
      };

      setUser(userData);
      setToken(response.dados.autenticacao.token);
      authService.saveToken(response.dados.autenticacao.token);

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro no login";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    registerData: RegisterRequest
  ): Promise<RegisterResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(registerData);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro no registro";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    authService.removeToken();
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
