import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownLeft, Banknote, Plus, Minus } from "lucide-react";
import { operacoesService } from "@/services/operacoes";
import { contasService } from "@/services/contas";
import type { Conta } from "@/types";

interface DepositoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositoModal: React.FC<DepositoModalProps> = ({ isOpen, onClose }) => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaSelecionada, setContaSelecionada] = useState<number | null>(null);
  const [cedulas, setCedulas] = useState<Record<string, number>>({
    DUZENTOS: 0,
    CEM: 0,
    CINQUENTA: 0,
    VINTE: 0,
    DEZ: 0,
    CINCO: 0,
    DOIS: 0,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      carregarContas();
    }
  }, [isOpen]);

  const carregarContas = async () => {
    try {
      console.log("Carregando contas para depósito...");
      const data = await contasService.obterContas();
      console.log("Contas carregadas para depósito:", data);
      setContas(data);
    } catch (error) {
      console.error("Erro ao carregar contas para depósito:", error);
      setErro("Erro ao carregar contas");
    }
  };

  const atualizarCedula = (valor: string, operacao: "add" | "subtract") => {
    setCedulas((prev) => ({
      ...prev,
      [valor]:
        operacao === "add" ? prev[valor] + 1 : Math.max(0, prev[valor] - 1),
    }));
  };

  const calcularTotal = () => {
    const valores: Record<string, number> = {
      DUZENTOS: 200,
      CEM: 100,
      CINQUENTA: 50,
      VINTE: 20,
      DEZ: 10,
      CINCO: 5,
      DOIS: 2,
    };

    return Object.entries(cedulas).reduce((total, [nome, quantidade]) => {
      return total + valores[nome] * quantidade;
    }, 0);
  };

  const executarDeposito = async () => {
    if (!contaSelecionada) return;

    const total = calcularTotal();
    if (total === 0) {
      setErro("Adicione pelo menos uma cédula");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      await operacoesService.depositar({
        contaId: contaSelecionada,
        valor: total,
        cedulas: cedulas,
      });

      // Reset e fechar modal
      setCedulas({
        DUZENTOS: 0,
        CEM: 0,
        CINQUENTA: 0,
        VINTE: 0,
        DEZ: 0,
        CINCO: 0,
        DOIS: 0,
      });
      onClose();
    } catch (error: any) {
      setErro(error.response?.data?.error || "Erro ao executar depósito");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowDownLeft className="h-5 w-5 mr-2 text-green-600" />
            Realizar Depósito
          </CardTitle>
          <CardDescription>
            Selecione a conta e adicione as cédulas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Seleção de conta */}
          <div className="space-y-2">
            <Label>Conta</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={contaSelecionada || ""}
              onChange={(e) => setContaSelecionada(Number(e.target.value))}
            >
              <option value="">Selecione uma conta</option>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.titular} - {formatCurrency(conta.saldo)}
                </option>
              ))}
            </select>
          </div>

          {/* Cédulas */}
          <div className="space-y-3">
            <Label>Cédulas a depositar:</Label>
            <div className="grid gap-3">
              {Object.entries(cedulas).map(([nome, quantidade]) => {
                const valores: Record<string, number> = {
                  DUZENTOS: 200,
                  CEM: 100,
                  CINQUENTA: 50,
                  VINTE: 20,
                  DEZ: 10,
                  CINCO: 5,
                  DOIS: 2,
                };
                const valor = valores[nome];

                return (
                  <Card key={nome} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Banknote className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">R$ {valor}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarCedula(nome, "subtract")}
                          disabled={quantidade === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="w-12 text-center font-medium">
                          {quantidade}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarCedula(nome, "add")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <div className="w-20 text-right font-semibold">
                          {formatCurrency(valor * quantidade)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total a depositar:</span>
              <span className="text-green-600">
                {formatCurrency(calcularTotal())}
              </span>
            </div>
          </div>

          {erro && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {erro}
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={executarDeposito}
              disabled={!contaSelecionada || calcularTotal() === 0 || loading}
              className="flex-1"
            >
              Confirmar Depósito
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositoModal;
