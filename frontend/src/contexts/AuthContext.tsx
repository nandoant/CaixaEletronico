import React, { createContext, useContext, useState, useEffect } from "react";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      // Carregar dados do usuário mock para teste
      const mockUser: User = {
        id: 2,
        login: "cliente_teste",
        email: "cliente@teste.com",
        perfil: "CLIENTE",
        contaId: 1,
        numeroConta: "2025000001",
        titular: "João Silva",
      };
      setUser(mockUser);
    } else {
      // Auto-login para facilitar testes de transferência
      const autoLoginUser: User = {
        id: 2,
        login: "cliente_teste",
        email: "cliente@teste.com",
        perfil: "CLIENTE",
        contaId: 1,
        numeroConta: "2025000001",
        titular: "João Silva",
      };
      setUser(autoLoginUser);
      setToken("mock-token-auto");
      localStorage.setItem("token", "mock-token-auto");
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implementar chamada para API de login
      // const response = await authService.login(email, password);
      // setToken(response.token);
      // setUser(response.user);
      // localStorage.setItem('token', response.token);

      // Mock temporário - Usuário de teste para transferências
      const mockUser: User = {
        id: 2, // ID do usuário (usuarioProprietarioId)
        login: "cliente_teste",
        email: email,
        perfil: "CLIENTE",
        contaId: 1, // ID da conta
        numeroConta: "2025000001",
        titular: "João Silva",
      };
      setUser(mockUser);
      setToken("mock-token");
      localStorage.setItem("token", "mock-token");
    } catch (error) {
      throw new Error("Falha no login");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
