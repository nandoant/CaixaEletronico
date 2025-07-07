import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Calendar, Download, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { contasService } from '@/services/contas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Conta, Operacao } from '@/types';

interface ExtratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  conta?: Conta;
}

const ExtratoModal: React.FC<ExtratoModalProps> = ({ isOpen, onClose, conta }) => {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [saldoAtual, setSaldoAtual] = useState(0);

  useEffect(() => {
    if (isOpen && conta) {
      carregarExtrato();
    }
  }, [isOpen, conta]);

  const carregarExtrato = async () => {
    if (!conta) return;

    setLoading(true);
    try {
      const response = await contasService.obterExtrato(
        conta.id, 
        dataInicio, 
        dataFim, 
        50
      );
      setOperacoes(response.operacoes);
      setSaldoAtual(response.saldoAtual);
    } catch (error) {
      console.error('Erro ao carregar extrato:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (tipo: string) => {
    switch (tipo) {
      case 'DEPOSITO':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'SAQUE':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'TRANSFERENCIA':
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
      case 'PAGAMENTO_PARCELA':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <ArrowLeftRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOperationColor = (tipo: string) => {
    switch (tipo) {
      case 'DEPOSITO':
        return 'text-green-600';
      case 'SAQUE':
      case 'PAGAMENTO_PARCELA':
        return 'text-red-600';
      case 'TRANSFERENCIA':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Extrato - Conta {conta?.numero}
            </div>
            <div className="text-lg font-bold text-green-600">
              Saldo: {formatCurrency(saldoAtual)}
            </div>
          </CardTitle>
          <CardDescription>
            Histórico de movimentações da conta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={carregarExtrato} disabled={loading}>
                Filtrar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {/* Lista de operações */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando...</p>
              </div>
            ) : operacoes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma operação encontrada</p>
              </div>
            ) : (
              operacoes.map((operacao) => (
                <Card key={operacao.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getOperationIcon(operacao.tipo)}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {operacao.tipo.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(operacao.dataHora)}
                        </p>
                        {operacao.descricao && (
                          <p className="text-sm text-muted-foreground">
                            {operacao.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getOperationColor(operacao.tipo)}`}>
                        {operacao.tipo === 'DEPOSITO' ? '+' : '-'}{formatCurrency(operacao.valor)}
                      </div>
                      {operacao.contaDestino && (
                        <p className="text-sm text-muted-foreground">
                          Para: {operacao.contaDestino.numero}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtratoModal;
