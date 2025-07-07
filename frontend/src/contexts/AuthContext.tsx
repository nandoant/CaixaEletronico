import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/api";
import type { Usuario, LoginForm } from "@/types";

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const savedUser = authService.getCurrentUser();
      if (savedUser && authService.isAuthenticated()) {
        setUser(savedUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginForm) => {
    try {
      console.log("Iniciando login com credenciais:", credentials);
      const response = await authService.login(credentials);
      console.log("Resposta do login:", response);

      localStorage.setItem("token", response.token);
      console.log("Token salvo:", response.token);

      // Criar objeto usuario compatível com a interface Usuario
      const usuario: Usuario = {
        id: response.userId,
        login: response.login,
        email: response.email,
        perfil: response.perfil,
      };

      localStorage.setItem("user", JSON.stringify(usuario));
      console.log("Usuário salvo:", usuario);
      setUser(usuario);
    } catch (error) {
      console.error("Erro no contexto de autenticação:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
