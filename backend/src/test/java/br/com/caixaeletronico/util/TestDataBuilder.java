package br.com.caixaeletronico.util;
import br.com.caixaeletronico.model.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
/**
 * Test Data Builder para criação de objetos de teste
 */
public class TestDataBuilder {
    public static ContaBuilder umaConta() {
        return new ContaBuilder();
    }
    public static UsuarioBuilder umUsuario() {
        return new UsuarioBuilder();
    }
    public static EstoqueGlobalBuilder umEstoqueGlobal() {
        return new EstoqueGlobalBuilder();
    }
    public static OperacaoBuilder umaOperacao() {
        return new OperacaoBuilder();
    }
    public static PagamentoAgendadoBuilder umPagamentoAgendado() {
        return new PagamentoAgendadoBuilder();
    }
    public static class ContaBuilder {
        private Conta conta = new Conta();
        public ContaBuilder comId(Long id) {
            conta.setId(id);
            return this;
        }
        public ContaBuilder comTitular(String titular) {
            conta.setTitular(titular);
            return this;
        }
        public ContaBuilder comSaldo(BigDecimal saldo) {
            conta.setSaldo(saldo);
            return this;
        }
        public ContaBuilder comUsuario(Usuario usuario) {
            conta.setUsuario(usuario);
            return this;
        }
        public ContaBuilder comNumeroConta(String numeroConta) {
            conta.setNumeroConta(numeroConta);
            return this;
        }
        public Conta build() {
            if (conta.getTitular() == null) conta.setTitular("João Silva");
            if (conta.getSaldo() == null) conta.setSaldo(new BigDecimal("1000.00"));
            if (conta.getNumeroConta() == null) conta.setNumeroConta("12345-6");
            return conta;
        }
    }
    public static class UsuarioBuilder {
        private Usuario usuario = new Usuario();
        public UsuarioBuilder comId(Long id) {
            usuario.setId(id);
            return this;
        }
        public UsuarioBuilder comLogin(String login) {
            usuario.setLogin(login);
            return this;
        }
        public UsuarioBuilder comEmail(String email) {
            usuario.setEmail(email);
            return this;
        }
        public UsuarioBuilder comSenha(String senha) {
            usuario.setSenha(senha);
            return this;
        }
        public UsuarioBuilder comPerfil(PerfilUsuario perfil) {
            usuario.setPerfil(perfil);
            return this;
        }
        public Usuario build() {
            if (usuario.getLogin() == null) usuario.setLogin("joao123");
            if (usuario.getEmail() == null) usuario.setEmail("joao@email.com");
            if (usuario.getSenha() == null) usuario.setSenha("senha123");
            if (usuario.getPerfil() == null) usuario.setPerfil(PerfilUsuario.CLIENTE);
            return usuario;
        }
    }
    public static class EstoqueGlobalBuilder {
        private EstoqueGlobal estoque = new EstoqueGlobal();
        public EstoqueGlobalBuilder comId(Long id) {
            estoque.setId(id);
            return this;
        }
        public EstoqueGlobalBuilder comValorCedula(ValorCedula valorCedula) {
            estoque.setValorCedula(valorCedula);
            return this;
        }
        public EstoqueGlobalBuilder comQuantidade(Integer quantidade) {
            estoque.setQuantidade(quantidade);
            return this;
        }
        public EstoqueGlobal build() {
            if (estoque.getValorCedula() == null) estoque.setValorCedula(ValorCedula.CEM);
            if (estoque.getQuantidade() == null) estoque.setQuantidade(10);
            return estoque;
        }
    }
    public static class OperacaoBuilder {
        private Operacao operacao = new Operacao();
        public OperacaoBuilder comId(Long id) {
            operacao.setId(id);
            return this;
        }
        public OperacaoBuilder comTipo(TipoOperacao tipo) {
            operacao.setTipo(tipo);
            return this;
        }
        public OperacaoBuilder comValor(BigDecimal valor) {
            operacao.setValor(valor);
            return this;
        }
        public OperacaoBuilder comUsuarioResponsavel(String usuarioResponsavel) {
            operacao.setUsuarioResponsavel(usuarioResponsavel);
            return this;
        }
        public OperacaoBuilder comDataHora(LocalDateTime dataHora) {
            operacao.setDataHora(dataHora);
            return this;
        }
        public OperacaoBuilder comContaOrigem(Conta contaOrigem) {
            operacao.setContaOrigem(contaOrigem);
            return this;
        }
        public OperacaoBuilder comContaDestino(Conta contaDestino) {
            operacao.setContaDestino(contaDestino);
            return this;
        }
        public Operacao build() {
            if (operacao.getTipo() == null) operacao.setTipo(TipoOperacao.DEPOSITO);
            if (operacao.getValor() == null) operacao.setValor(new BigDecimal("100.00"));
            if (operacao.getDataHora() == null) operacao.setDataHora(LocalDateTime.now());
            if (operacao.getUsuarioResponsavel() == null) operacao.setUsuarioResponsavel("joao@email.com");
            return operacao;
        }
    }
    public static class PagamentoAgendadoBuilder {
        private PagamentoAgendado pagamento = new PagamentoAgendado();
        public PagamentoAgendadoBuilder comId(Long id) {
            pagamento.setId(id);
            return this;
        }
        public PagamentoAgendadoBuilder comContaOrigem(Conta contaOrigem) {
            pagamento.setContaOrigem(contaOrigem);
            return this;
        }
        public PagamentoAgendadoBuilder comContaDestino(Conta contaDestino) {
            pagamento.setContaDestino(contaDestino);
            return this;
        }
        public PagamentoAgendadoBuilder comValorTotal(BigDecimal valorTotal) {
            pagamento.setValorTotal(valorTotal);
            return this;
        }
        public PagamentoAgendadoBuilder comQuantidadeParcelas(Integer quantidadeParcelas) {
            pagamento.setQuantidadeParcelas(quantidadeParcelas);
            return this;
        }
        public PagamentoAgendadoBuilder comStatus(StatusAgendamento status) {
            pagamento.setStatus(status);
            return this;
        }
        public PagamentoAgendado build() {
            if (pagamento.getValorTotal() == null) pagamento.setValorTotal(new BigDecimal("50.00"));
            if (pagamento.getQuantidadeParcelas() == null) pagamento.setQuantidadeParcelas(1);
            if (pagamento.getPeriodicidadeDias() == null) pagamento.setPeriodicidadeDias(30);
            if (pagamento.getParcelasRestantes() == null) pagamento.setParcelasRestantes(1);
            if (pagamento.getStatus() == null) pagamento.setStatus(StatusAgendamento.ATIVO);
            return pagamento;
        }
    }
}
