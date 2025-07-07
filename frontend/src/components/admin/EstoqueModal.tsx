import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, RefreshCw } from 'lucide-react';
import api from '@/services/api';
import type { EstoqueGlobal } from '@/types';

interface EstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EstoqueModal: React.FC<EstoqueModalProps> = ({ isOpen, onClose }) => {
  const [estoque, setEstoque] = useState<EstoqueGlobal[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen) {
      carregarEstoque();
    }
  }, [isOpen]);

  const carregarEstoque = async () => {
    setLoading(true);
    setErro('');
    try {
      const response = await api.get('/estoque/cedulas');
      setEstoque(response.data.estoque);
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  };

  const calcularValorTotal = () => {
    return estoque.reduce((total, item) => {
      return total + (item.valorCedula.valor * item.quantidade);
    }, 0);
  };

  const calcularTotalCedulas = () => {
    return estoque.reduce((total, item) => total + item.quantidade, 0);
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Banknote className="h-5 w-5 mr-2" />
              Estoque Global de Cédulas
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={carregarEstoque}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Visualização do estoque de cédulas disponíveis no sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-green-50">
              <div className="text-center">
                <h3 className="font-semibold text-green-800">Valor Total</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calcularValorTotal())}
                </p>
              </div>
            </Card>
            
            <Card className="p-4 bg-blue-50">
              <div className="text-center">
                <h3 className="font-semibold text-blue-800">Total de Cédulas</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {calcularTotalCedulas().toLocaleString('pt-BR')}
                </p>
              </div>
            </Card>
            
            <Card className="p-4 bg-purple-50">
              <div className="text-center">
                <h3 className="font-semibold text-purple-800">Tipos de Cédulas</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {estoque.length}
                </p>
              </div>
            </Card>
          </div>

          {/* Estoque detalhado */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Detalhamento por Cédula</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando...</p>
              </div>
            ) : erro ? (
              <div className="text-center py-8">
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {erro}
                </div>
              </div>
            ) : estoque.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma cédula encontrada</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {estoque
                  .sort((a, b) => b.valorCedula.valor - a.valorCedula.valor)
                  .map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <Banknote className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">
                              R$ {item.valorCedula.valor.toFixed(2)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.valorCedula.nome}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-2xl font-bold">
                            {item.quantidade.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            cédulas
                          </div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(item.valorCedula.valor * item.quantidade)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de status visual */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.quantidade > 100 ? 'bg-green-500' :
                              item.quantidade > 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (item.quantidade / 200) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Estoque:</span>
                          <span className={
                            item.quantidade > 100 ? 'text-green-600' :
                            item.quantidade > 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }>
                            {item.quantidade > 100 ? 'Alto' :
                             item.quantidade > 50 ? 'Médio' :
                             'Baixo'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
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

export default EstoqueModal;
