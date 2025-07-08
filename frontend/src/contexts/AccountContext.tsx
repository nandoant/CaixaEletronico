import React, { createContext, useContext, useState, useEffect } from "react";
import { SaldoResponse } from "../types/operacoes";
import { operacoesService } from "../services/operacoesService";
import { useAuth } from "./AuthContext";

interface AccountData {
  contaId: number;
  numeroConta: string;
  titular: string;
  usuarioProprietario: string;
  usuarioProprietarioId: number;
  saldo: number;
  dataUltimaConsulta: string;
}

interface AccountContextType {
  accountData: AccountData | null;
  isLoading: boolean;
  error: string | null;
  refreshSaldo: () => Promise<void>;
  updateSaldo: (novoSaldo: number) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

interface AccountProviderProps {
  children: React.ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({
  children,
}) => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Carregar dados da conta quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user?.contaId) {
      console.log("🔍 Trigger para carregar dados da conta - isAuthenticated:", isAuthenticated, "contaId:", user?.contaId, "accountData exists:", !!accountData);
      
      // Se não temos dados da conta OU se mudou o usuário, carrega os dados
      if (!accountData || accountData.contaId !== user.contaId) {
        loadAccountData();
      }
    }
  }, [isAuthenticated, user?.contaId]);

  const loadAccountData = async () => {
    if (!user?.contaId) {
      console.warn("⚠️ Tentativa de carregar dados sem contaId válido");
      return;
    }

    console.log("🔍 Carregando dados da conta para contaId:", user.contaId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await operacoesService.consultarSaldo(user.contaId);
      console.log("✅ Resposta COMPLETA do backend:", JSON.stringify(response, null, 2));

      const newAccountData: AccountData = {
        contaId: response.conta.contaId,
        numeroConta: response.conta.numeroConta,
        titular: response.conta.titular,
        usuarioProprietario: response.conta.usuarioProprietario,
        usuarioProprietarioId: response.conta.usuarioProprietarioId,
        saldo: response.conta.saldo,
        dataUltimaConsulta: response.dados.dataConsulta,
      };

      console.log("💰 Dados da conta processados:", JSON.stringify(newAccountData, null, 2));
      setAccountData(newAccountData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados da conta";
      console.error("❌ Erro ao carregar dados da conta:", err);
      setError(errorMessage);
      
      // Em caso de erro, pelo menos definir dados básicos com saldo zero
      if (user?.contaId) {
        console.log("🔄 Definindo dados básicos após erro");
        const basicAccountData: AccountData = {
          contaId: user.contaId,
          numeroConta: user.numeroConta || "",
          titular: user.titular || "",
          usuarioProprietario: user.login || "",
          usuarioProprietarioId: user.id,
          saldo: 0,
          dataUltimaConsulta: new Date().toISOString(),
        };
        setAccountData(basicAccountData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSaldo = async () => {
    if (!user?.contaId) {
      throw new Error("Usuário não autenticado");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await operacoesService.consultarSaldo(user.contaId);

      if (accountData) {
        setAccountData({
          ...accountData,
          saldo: response.conta.saldo,
          dataUltimaConsulta: response.dados.dataConsulta,
        });
      } else {
        const newAccountData: AccountData = {
          contaId: response.conta.contaId,
          numeroConta: response.conta.numeroConta,
          titular: response.conta.titular,
          usuarioProprietario: response.conta.usuarioProprietario,
          usuarioProprietarioId: response.conta.usuarioProprietarioId,
          saldo: response.conta.saldo,
          dataUltimaConsulta: response.dados.dataConsulta,
        };
        setAccountData(newAccountData);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar saldo";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSaldo = (novoSaldo: number) => {
    if (accountData) {
      setAccountData({
        ...accountData,
        saldo: novoSaldo,
        dataUltimaConsulta: new Date().toISOString(),
      });
    }
  };

  // Limpar dados quando o usuário fizer logout
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("🚪 Usuário fez logout, limpando dados da conta");
      setAccountData(null);
      setError(null);
    }
  }, [isAuthenticated]);

  const value = {
    accountData,
    isLoading,
    error,
    refreshSaldo,
    updateSaldo,
  };

  // Debug: Expor no window para debug
  if (typeof window !== 'undefined') {
    (window as any).debugAccount = {
      accountData,
      isLoading,
      error,
      user,
      isAuthenticated,
      loadAccountData,
    };
  }

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};
