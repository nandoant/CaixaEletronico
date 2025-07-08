package br.com.caixaeletronico.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Login é obrigatório")
    @Size(min = 3, max = 50, message = "Login deve ter entre 3 e 50 caracteres")
    @Column(unique = true)
    private String login;
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    @Column(unique = true)
    private String email;
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String senha;
    @NotNull(message = "Perfil é obrigatório")
    @Enumerated(EnumType.STRING)
    private PerfilUsuario perfil;
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Conta conta;
    public Usuario() {}
    public Usuario(String login, String email, String senha, PerfilUsuario perfil) {
        this.login = login;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getLogin() {
        return login;
    }
    public void setLogin(String login) {
        this.login = login;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getSenha() {
        return senha;
    }
    public void setSenha(String senha) {
        this.senha = senha;
    }
    public PerfilUsuario getPerfil() {
        return perfil;
    }
    public void setPerfil(PerfilUsuario perfil) {
        this.perfil = perfil;
    }
    public Conta getConta() {
        return conta;
    }
    public void setConta(Conta conta) {
        this.conta = conta;
    }
}
