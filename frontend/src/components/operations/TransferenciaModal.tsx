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
import { ArrowLeftRight } from "lucide-react";
import { operacoesService } from "@/services/operacoes";
import { contasService } from "@/services/contas";
import type { Conta } from "@/types";

interface TransferenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransferenciaModal: React.FC<TransferenciaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaOrigemId, setContaOrigemId] = useState<number | null>(null);
  const [contaDestinoId, setContaDestinoId] = useState<number | null>(null);
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      carregarContas();
    }
  }, [isOpen]);

  const carregarContas = async () => {
    try {
      console.log("Carregando contas para transferência...");
      const data = await contasService.obterTodasContas();
      console.log("Contas carregadas para transferência:", data);
      setContas(data);
    } catch (error) {
      console.error("Erro ao carregar contas para transferência:", error);
      setErro("Erro ao carregar contas");
    }
  };

  const executarTransferencia = async () => {
    if (!contaOrigemId || !contaDestinoId || !valor) {
      setErro("Preencha todos os campos");
      return;
    }

    if (contaOrigemId === contaDestinoId) {
      setErro("A conta de origem deve ser diferente da conta de destino");
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (valorNumerico <= 0) {
      setErro("O valor deve ser maior que zero");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      await operacoesService.transferir({
        contaOrigemId,
        contaDestinoId,
        valor: valorNumerico,
      });

      // Reset e fechar modal
      setContaOrigemId(null);
      setContaDestinoId(null);
      setValor("");
      onClose();
    } catch (error: any) {
      setErro(error.response?.data?.error || "Erro ao executar transferência");
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

  const getContaOrigemOptions = () => {
    return contas.filter((conta) => conta.id !== contaDestinoId);
  };

  const getContaDestinoOptions = () => {
    return contas.filter((conta) => conta.id !== contaOrigemId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowLeftRight className="h-5 w-5 mr-2 text-blue-600" />
            Realizar Transferência
          </CardTitle>
          <CardDescription>
            Transfira dinheiro entre suas contas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Conta de origem */}
          <div className="space-y-2">
            <Label>Conta de Origem</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={contaOrigemId || ""}
              onChange={(e) => setContaOrigemId(Number(e.target.value))}
            >
              <option value="">Selecione a conta de origem</option>
              {getContaOrigemOptions().map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.titular} - {formatCurrency(conta.saldo)}
                </option>
              ))}
            </select>
          </div>

          {/* Conta de destino */}
          <div className="space-y-2">
            <Label>Conta de Destino</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={contaDestinoId || ""}
              onChange={(e) => setContaDestinoId(Number(e.target.value))}
            >
              <option value="">Selecione a conta de destino</option>
              {getContaDestinoOptions().map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.titular} - {formatCurrency(conta.saldo)}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Digite o valor"
              min="0.01"
              step="0.01"
            />
          </div>

          {/* Resumo */}
          {contaOrigemId && contaDestinoId && valor && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo da Transferência:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>De:</span>
                  <span>
                    Conta {contas.find((c) => c.id === contaOrigemId)?.titular}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Para:</span>
                  <span>
                    Conta {contas.find((c) => c.id === contaDestinoId)?.titular}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Valor:</span>
                  <span>{formatCurrency(parseFloat(valor) || 0)}</span>
                </div>
              </div>
            </div>
          )}

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
              onClick={executarTransferencia}
              disabled={!contaOrigemId || !contaDestinoId || !valor || loading}
              className="flex-1"
            >
              Confirmar Transferência
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferenciaModal;
