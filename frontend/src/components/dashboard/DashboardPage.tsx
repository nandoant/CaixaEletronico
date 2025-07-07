import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Calendar,
  Eye,
  LogOut,
  Settings,
  PieChart,
} from "lucide-react";
import { contasService } from "@/services/contas";
import SaqueModal from "@/components/operations/SaqueModal";
import DepositoModal from "@/components/operations/DepositoModal";
import ExtratoModal from "@/components/operations/ExtratoModal";
import TransferenciaModal from "@/components/operations/TransferenciaModal";
import PagamentoModal from "@/components/operations/PagamentoModal";
import EstoqueModal from "@/components/admin/EstoqueModal";
import type { Conta } from "@/types";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saqueModalOpen, setSaqueModalOpen] = useState(false);
  const [depositoModalOpen, setDepositoModalOpen] = useState(false);
  const [extratoModalOpen, setExtratoModalOpen] = useState(false);
  const [transferenciaModalOpen, setTransferenciaModalOpen] = useState(false);
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [estoqueModalOpen, setEstoqueModalOpen] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<Conta | undefined>();

  useEffect(() => {
    const fetchContas = async () => {
      try {
        console.log("Carregando contas...");
        const data = await contasService.obterContas();
        console.log("Contas carregadas:", data);
        setContas(data);
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
        // Adicionar toast de erro futuramente
      } finally {
        setLoading(false);
      }
    };

    fetchContas();
  }, [saqueModalOpen, depositoModalOpen, transferenciaModalOpen]); // Recarregar após operações

  const abrirExtrato = (conta: Conta) => {
    setContaSelecionada(conta);
    setExtratoModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isAdmin = user?.perfil === "ADMIN";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Banknote className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Caixa Eletrônico
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.login}
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    ADMIN
                  </span>
                )}
              </span>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contas do usuário */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Suas Contas</h2>
          {contas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {loading ? "Carregando contas..." : "Nenhuma conta encontrada"}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {contas.map((conta) => (
            <Card key={conta.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{conta.titular}</span>
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Proprietário: {conta.proprietario}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  {formatCurrency(conta.saldo)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => abrirExtrato(conta)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Extrato
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Operações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setDepositoModalOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowDownLeft className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Depósito</h3>
                  <p className="text-sm text-muted-foreground">
                    Depositar dinheiro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSaqueModalOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Saque</h3>
                  <p className="text-sm text-muted-foreground">
                    Sacar dinheiro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setTransferenciaModalOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Transferência</h3>
                  <p className="text-sm text-muted-foreground">
                    Transferir entre contas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setPagamentoModalOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Pagamentos</h3>
                  <p className="text-sm text-muted-foreground">
                    Agendar pagamentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel Admin */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Painel Administrativo
              </CardTitle>
              <CardDescription>
                Ferramentas de administração do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => setEstoqueModalOpen(true)}
                >
                  <Banknote className="h-6 w-6 mb-2" />
                  Estoque de Cédulas
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <ArrowLeftRight className="h-6 w-6 mb-2" />
                  Desfazer Operações
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <PieChart className="h-6 w-6 mb-2" />
                  Relatórios
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modais */}
      <SaqueModal
        isOpen={saqueModalOpen}
        onClose={() => setSaqueModalOpen(false)}
      />
      <DepositoModal
        isOpen={depositoModalOpen}
        onClose={() => setDepositoModalOpen(false)}
      />
      <ExtratoModal
        isOpen={extratoModalOpen}
        onClose={() => setExtratoModalOpen(false)}
        conta={contaSelecionada}
      />
      <TransferenciaModal
        isOpen={transferenciaModalOpen}
        onClose={() => setTransferenciaModalOpen(false)}
      />
      <PagamentoModal
        isOpen={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
      />
      <EstoqueModal
        isOpen={estoqueModalOpen}
        onClose={() => setEstoqueModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
