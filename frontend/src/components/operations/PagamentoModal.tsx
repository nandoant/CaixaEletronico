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
import { Calendar, Plus } from "lucide-react";
import { pagamentosService } from "@/services/pagamentos";
import { contasService } from "@/services/contas";
import type { Conta, PagamentoAgendado } from "@/types";

interface PagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PagamentoModal: React.FC<PagamentoModalProps> = ({ isOpen, onClose }) => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoAgendado[]>([]);
  const [modoExibicao, setModoExibicao] = useState<"lista" | "novo">("lista");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Dados do novo pagamento
  const [novoPagamento, setNovoPagamento] = useState({
    contaId: "",
    valorTotal: "",
    quantidadeParcelas: "",
    periodicidadeDias: "30",
    dataInicio: "",
    descricao: "",
  });

  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      console.log("Carregando dados para pagamento...");
      const [contasData, pagamentosData] = await Promise.all([
        contasService.obterContas(),
        pagamentosService.obterPendentes(),
      ]);
      console.log("Contas carregadas para pagamento:", contasData);
      console.log("Pagamentos carregados:", pagamentosData);
      setContas(contasData);
      setPagamentos(pagamentosData);
    } catch (error) {
      console.error("Erro ao carregar dados para pagamento:", error);
      setErro("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const criarPagamento = async () => {
    if (
      !novoPagamento.contaId ||
      !novoPagamento.valorTotal ||
      !novoPagamento.quantidadeParcelas ||
      !novoPagamento.dataInicio
    ) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      await pagamentosService.agendar({
        contaId: parseInt(novoPagamento.contaId),
        valorTotal: parseFloat(novoPagamento.valorTotal),
        quantidadeParcelas: parseInt(novoPagamento.quantidadeParcelas),
        periodicidadeDias: parseInt(novoPagamento.periodicidadeDias),
        dataInicio: novoPagamento.dataInicio,
        descricao: novoPagamento.descricao,
      });

      // Reset e voltar para lista
      setNovoPagamento({
        contaId: "",
        valorTotal: "",
        quantidadeParcelas: "",
        periodicidadeDias: "30",
        dataInicio: "",
        descricao: "",
      });
      setModoExibicao("lista");
      carregarDados();
    } catch (error: any) {
      setErro(error.response?.data?.error || "Erro ao criar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const cancelarPagamento = async (id: number) => {
    setLoading(true);
    try {
      await pagamentosService.cancelar(id);
      carregarDados();
    } catch (error: any) {
      setErro(error.response?.data?.error || "Erro ao cancelar pagamento");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleInputChange = (field: string, value: string) => {
    setNovoPagamento((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Pagamentos Agendados
            </div>
            <div className="flex space-x-2">
              <Button
                variant={modoExibicao === "lista" ? "default" : "outline"}
                onClick={() => setModoExibicao("lista")}
              >
                Lista
              </Button>
              <Button
                variant={modoExibicao === "novo" ? "default" : "outline"}
                onClick={() => setModoExibicao("novo")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {modoExibicao === "lista"
              ? "Gerencie seus pagamentos agendados"
              : "Criar novo pagamento agendado"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {modoExibicao === "lista" ? (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando...</p>
                </div>
              ) : pagamentos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum pagamento agendado
                  </p>
                </div>
              ) : (
                pagamentos.map((pagamento) => (
                  <Card key={pagamento.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">
                            Conta{" "}
                            {
                              contas.find((c) => c.id === pagamento.conta.id)
                                ?.titular
                            }
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              pagamento.status === "ATIVO"
                                ? "bg-green-100 text-green-800"
                                : pagamento.status === "PAUSADO"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {pagamento.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Valor total: {formatCurrency(pagamento.valorTotal)}
                          </p>
                          <p>
                            Parcelas: {pagamento.parcelasExecutadas}/
                            {pagamento.quantidadeParcelas}
                          </p>
                          <p>
                            Valor por parcela:{" "}
                            {formatCurrency(pagamento.valorParcela)}
                          </p>
                          <p>
                            Próxima execução:{" "}
                            {pagamento.proximaExecucao
                              ? formatDate(pagamento.proximaExecucao)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelarPagamento(pagamento.id)}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conta</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={novoPagamento.contaId}
                    onChange={(e) =>
                      handleInputChange("contaId", e.target.value)
                    }
                  >
                    <option value="">Selecione uma conta</option>
                    {contas.map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.titular} - {formatCurrency(conta.saldo)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                  <Input
                    id="valorTotal"
                    type="number"
                    value={novoPagamento.valorTotal}
                    onChange={(e) =>
                      handleInputChange("valorTotal", e.target.value)
                    }
                    placeholder="Digite o valor total"
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidadeParcelas">
                    Quantidade de Parcelas
                  </Label>
                  <Input
                    id="quantidadeParcelas"
                    type="number"
                    value={novoPagamento.quantidadeParcelas}
                    onChange={(e) =>
                      handleInputChange("quantidadeParcelas", e.target.value)
                    }
                    placeholder="Digite a quantidade"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodicidadeDias">
                    Periodicidade (dias)
                  </Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={novoPagamento.periodicidadeDias}
                    onChange={(e) =>
                      handleInputChange("periodicidadeDias", e.target.value)
                    }
                  >
                    <option value="7">Semanal (7 dias)</option>
                    <option value="15">Quinzenal (15 dias)</option>
                    <option value="30">Mensal (30 dias)</option>
                    <option value="90">Trimestral (90 dias)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={novoPagamento.dataInicio}
                    onChange={(e) =>
                      handleInputChange("dataInicio", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Input
                    id="descricao"
                    value={novoPagamento.descricao}
                    onChange={(e) =>
                      handleInputChange("descricao", e.target.value)
                    }
                    placeholder="Descrição do pagamento"
                  />
                </div>
              </div>

              {novoPagamento.valorTotal && novoPagamento.quantidadeParcelas && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Resumo:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Valor por parcela:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          parseFloat(novoPagamento.valorTotal) /
                            parseInt(novoPagamento.quantidadeParcelas)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Periodicidade:</span>
                      <span>{novoPagamento.periodicidadeDias} dias</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={criarPagamento}
                disabled={
                  loading || !novoPagamento.contaId || !novoPagamento.valorTotal
                }
                className="w-full"
              >
                Criar Pagamento Agendado
              </Button>
            </div>
          )}

          {erro && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mt-4">
              {erro}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentoModal;
