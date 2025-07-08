import { useAccount } from '../contexts/AccountContext';

/**
 * Hook personalizado para acessar dados da conta de forma simplificada
 */
export const useConta = () => {
    const { accountData, isLoading, error, refreshSaldo, updateSaldo } = useAccount();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDateTime = (dateString: string): string => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(dateString));
    };

    return {
        // Dados da conta
        conta: accountData,
        saldo: accountData?.saldo ?? 0,
        saldoFormatado: accountData ? formatCurrency(accountData.saldo) : 'R$ 0,00',
        numeroConta: accountData?.numeroConta ?? '',
        titular: accountData?.titular ?? '',
        dataUltimaConsulta: accountData?.dataUltimaConsulta ? formatDateTime(accountData.dataUltimaConsulta) : '',

        // Estados
        isLoading,
        error,

        // Funções
        refreshSaldo,
        updateSaldo,

        // Utilitários
        formatCurrency,
        formatDateTime,
    };
};
