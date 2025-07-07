import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Banknote } from 'lucide-react';
import { operacoesService } from '@/services/operacoes';
import { contasService } from '@/services/contas';
import type { Conta, CombinacaoCedulas } from '@/types';

interface SaqueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaqueModal: React.FC<SaqueModalProps> = ({ isOpen, onClose }) => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaSelecionada, setContaSelecionada] = useState<number | null>(null);
  const [valor, setValor] = useState('');
  const [opcoesSaque, setOpcoesSaque] = useState<CombinacaoCedulas[]>([]);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen) {
      carregarContas();
    }
  }, [isOpen]);

  const carregarContas = async () => {
    try {
      console.log('Carregando contas para saque...');
      const data = await contasService.obterContas();
      console.log('Contas carregadas para saque:', data);
      setContas(data);
    } catch (error) {
      console.error('Erro ao carregar contas para saque:', error);
      setErro('Erro ao carregar contas');
    }
  };

  const buscarOpcoesSaque = async () => {
    if (!contaSelecionada || !valor) return;

    setLoading(true);
    setErro('');

    try {
      const opcoes = await operacoesService.obterOpcoesSaque(
        contaSelecionada, 
        parseInt(valor)
      );
      setOpcoesSaque(opcoes);
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao buscar opções de saque');
    } finally {
      setLoading(false);
    }
  };

  const executarSaque = async () => {
    if (!contaSelecionada || !opcaoSelecionada) return;

    setLoading(true);
    setErro('');

    try {
      await operacoesService.sacar({
        contaId: contaSelecionada,
        valor: parseInt(valor),
        combinacaoId: opcaoSelecionada
      });
      
      // Reset e fechar modal
      setValor('');
      setOpcoesSaque([]);
      setOpcaoSelecionada(null);
      onClose();
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao executar saque');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUpRight className="h-5 w-5 mr-2 text-red-600" />
            Realizar Saque
          </CardTitle>
          <CardDescription>
            Selecione a conta e o valor para sacar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Seleção de conta */}
          <div className="space-y-2">
            <Label>Conta</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={contaSelecionada || ''}
              onChange={(e) => setContaSelecionada(Number(e.target.value))}
            >
              <option value="">Selecione uma conta</option>
              {contas.map(conta => (
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
              min="10"
              step="10"
            />
          </div>

          <Button 
            onClick={buscarOpcoesSaque} 
            disabled={!contaSelecionada || !valor || loading}
            className="w-full"
          >
            Buscar Opções de Saque
          </Button>

          {/* Opções de saque */}
          {opcoesSaque.length > 0 && (
            <div className="space-y-3">
              <Label>Escolha como receber as cédulas:</Label>
              <div className="grid gap-3">
                {opcoesSaque.map((opcao) => (
                  <Card 
                    key={opcao.id}
                    className={`cursor-pointer transition-colors ${
                      opcaoSelecionada === opcao.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setOpcaoSelecionada(opcao.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          {Object.entries(opcao.combinacao).map(([cedula, quantidade]) => (
                            <div key={cedula} className="text-center">
                              <div className="flex items-center space-x-1">
                                <Banknote className="h-4 w-4" />
                                <span className="font-semibold">R$ {cedula}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {quantidade}x
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(opcao.valorTotal)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
              onClick={executarSaque}
              disabled={!opcaoSelecionada || loading}
              className="flex-1"
            >
              Confirmar Saque
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaqueModal;
