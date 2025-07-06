package br.com.caixaeletronico.service;

import br.com.caixaeletronico.model.Conta;
import br.com.caixaeletronico.model.Operacao;
import br.com.caixaeletronico.repository.OperacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExtractService {
    
    @Autowired
    private OperacaoRepository operacaoRepository;
    
    public List<Operacao> obterExtrato(Conta conta) {
        return operacaoRepository.findByContaOrderByDataHoraDesc(conta);
    }
    
    public List<Operacao> obterExtratoPorPeriodo(Conta conta, LocalDateTime dataInicio, LocalDateTime dataFim) {
        return operacaoRepository.findByContaAndDataHoraBetweenOrderByDataHoraDesc(conta, dataInicio, dataFim);
    }
    
    public List<Operacao> obterUltimasOperacoes(Conta conta, int limite) {
        List<Operacao> operacoes = obterExtrato(conta);
        
        if (operacoes.size() <= limite) {
            return operacoes;
        }
        
        return operacoes.subList(0, limite);
    }
}
